const jwt = import('jsonwebtoken');
const { User } = import('../models/User');

class AuthMiddleware {
  // Vérification du token
  static async authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
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
  static checkRole(roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Accès refusé',
          requiredRoles: roles 
        });
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

export default = AuthMiddleware;
