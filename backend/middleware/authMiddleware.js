const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { User } = require('../models/User');
const AdsPlatformService = require('../services/adsPlatformService');
const Admin = require('../models/Admin');

// Configuration de sécurité Helmet
const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

// Limitation de taux de requêtes
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite de 100 requêtes par fenêtre
  message: 'Trop de requêtes, veuillez réessayer plus tard'
});

class AuthMiddleware {
  // Middleware d'authentification admin
  async requireAdminAuth(req, res, next) {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        return res.status(401).json({ 
          message: 'Aucun token fourni. Authentification requise.' 
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const admin = await Admin.findById(decoded.id).select('-password');
      
      if (!admin) {
        return res.status(401).json({ 
          message: 'Admin non trouvé. Token invalide.' 
        });
      }

      // Vérification du compte verrouillé
      if (admin.isLocked && admin.lockUntil > Date.now()) {
        return res.status(403).json({ 
          message: 'Compte verrouillé. Réessayez plus tard.' 
        });
      }

      // Ajout des informations de l'admin à la requête
      req.user = {
        id: admin._id,
        role: admin.role,
        permissions: admin.permissions
      };

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token expiré. Veuillez vous reconnecter.' 
        });
      }

      res.status(401).json({ 
        message: 'Authentification échouée',
        error: error.message 
      });
    }
  }

  // Extraction du token
  extractToken(req) {
    if (req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer ')) {
      return req.headers.authorization.split(' ')[1];
    }
    return null;
  }

  // Middleware de vérification 2FA
  async requireTwoFactor(req, res, next) {
    try {
      const admin = await Admin.findById(req.user.id);

      if (admin.twoFactorEnabled && !req.session.twoFactorVerified) {
        return res.status(403).json({ 
          message: 'Authentification 2FA requise' 
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur de vérification 2FA',
        error: error.message 
      });
    }
  }

  // Middleware de génération de token de rafraîchissement
  async generateRefreshToken(req, res, next) {
    try {
      const admin = await Admin.findById(req.user.id);
      
      const refreshToken = jwt.sign(
        { id: admin._id }, 
        process.env.REFRESH_TOKEN_SECRET, 
        { expiresIn: '7d' }
      );

      req.refreshToken = refreshToken;
      next();
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur de génération du token de rafraîchissement',
        error: error.message 
      });
    }
  }

  // Vérification du token de rafraîchissement
  async verifyRefreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(401).json({ 
          message: 'Token de rafraîchissement requis' 
        });
      }

      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      
      const admin = await Admin.findById(decoded.id);
      
      if (!admin) {
        return res.status(401).json({ 
          message: 'Admin non trouvé' 
        });
      }

      // Génération d'un nouveau token d'accès
      const newAccessToken = jwt.sign(
        { 
          id: admin._id,
          role: admin.role,
          permissions: admin.permissions
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
      );

      res.json({ 
        accessToken: newAccessToken 
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token de rafraîchissement expiré' 
        });
      }

      res.status(401).json({ 
        message: 'Authentification de rafraîchissement échouée',
        error: error.message 
      });
    }
  }

  // Vérification du token
  static async authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'],
        maxAge: '1h' // Expiration du token
      });

      // Vérifier si l'utilisateur existe encore
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé' });
      }

      // Vérifier le statut du compte
      if (user.status !== 'active') {
        return res.status(403).json({ 
          error: 'Compte inactif',
          status: user.status 
        });
      }

      // Synchronisation avec les plateformes publicitaires
      try {
        await AdsPlatformService.createRemarketingAudience(user);
      } catch (adsError) {
        console.error('Erreur de synchronisation publicitaire', adsError);
        // Ne pas bloquer l'authentification si la synchronisation échoue
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expiré' });
      }
      return res.status(403).json({ error: 'Token invalide' });
    }
  }

  // Vérification des rôles
  static authorizeRoles(...roles) {
    return (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }
      next();
    };
  }

  // Limitation des tentatives de connexion
  static async rateLimitLogin(req, res, next) {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      const now = new Date();
      
      // Réinitialiser les tentatives après un certain temps
      if (user.lockUntil && user.lockUntil < now) {
        user.loginAttempts = 0;
        user.lockUntil = null;
        await user.save();
      }

      // Vérifier si le compte est verrouillé
      if (user.lockUntil && user.lockUntil > now) {
        const remainingTime = Math.ceil(
          (user.lockUntil.getTime() - now.getTime()) / 60000
        );
        
        return res.status(429).json({
          error: 'Compte temporairement verrouillé',
          remainingMinutes: remainingTime
        });
      }

      // Incrémenter les tentatives de connexion
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // Verrouiller après 5 tentatives
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(now.getTime() + 30 * 60000); // 30 minutes
        await user.save();

        return res.status(429).json({
          error: 'Trop de tentatives de connexion',
          lockDuration: 30
        });
      }

      await user.save();
    }

    next();
  }

  // Validation du mot de passe
  static validatePassword(req, res, next) {
    const { password } = req.body;
    
    // Critères de mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: 'Mot de passe invalide',
        requirements: [
          'Au moins 8 caractères',
          'Une majuscule',
          'Une minuscule',
          'Un chiffre',
          'Un caractère spécial'
        ]
      });
    }

    next();
  }

  // Journalisation des événements de sécurité
  static async logSecurityEvent(type, details, user = null) {
    try {
      const securityLog = new SecurityLog({
        type,
        details,
        userId: user ? user.id : null,
        timestamp: new Date()
      });

      await securityLog.save();
    } catch (error) {
      console.error('Erreur de journalisation de sécurité', error);
    }
  }
}

module.exports = {
  AuthMiddleware,
  securityMiddleware,
  rateLimiter
};
