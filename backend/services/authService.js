const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const config = require('../config/config');

class AuthService {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
  }

  // Inscription
  async register(userData) {
    try {
      const existingUser = await User.findOne({ 
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      });

      if (existingUser) {
        throw new Error('Email ou nom d\'utilisateur déjà existant');
      }

      const user = new User(userData);
      await user.save();

      // Génération du token d'activation
      const activationToken = this.generateActivationToken(user);

      // Envoi d'email d'activation (à implémenter)
      // await this.sendActivationEmail(user.email, activationToken);

      return {
        user: this.sanitizeUser(user),
        token: this.generateJWT(user)
      };
    } catch (error) {
      throw new Error(`Erreur d'inscription : ${error.message}`);
    }
  }

  // Connexion
  async login(credentials) {
    const { username, password } = credentials;

    try {
      const user = await User.findOne({ username });

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Vérification du compte verrouillé
      if (user.isLocked) {
        throw new Error('Compte temporairement verrouillé. Réessayez plus tard.');
      }

      // Vérification du mot de passe
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        await User.incrementLoginAttempts(username);
        throw new Error('Mot de passe incorrect');
      }

      // Réinitialisation des tentatives de connexion
      await User.resetLoginAttempts(username);

      // Mise à jour de la dernière connexion
      user.lastLogin = new Date();
      await user.save();

      // Authentification à deux facteurs
      if (user.twoFactorEnabled) {
        return {
          twoFactorRequired: true,
          userId: user._id
        };
      }

      return {
        user: this.sanitizeUser(user),
        token: this.generateJWT(user),
        authToken: user.generateAuthToken()
      };
    } catch (error) {
      throw new Error(`Erreur de connexion : ${error.message}`);
    }
  }

  // Vérification 2FA
  async verifyTwoFactor(userId, code) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const isValid = user.verifyTwoFactor(code);

    if (!isValid) {
      throw new Error('Code 2FA invalide');
    }

    return {
      user: this.sanitizeUser(user),
      token: this.generateJWT(user),
      authToken: user.generateAuthToken()
    };
  }

  // Réinitialisation de mot de passe
  async initiatePasswordReset(email) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('Aucun utilisateur trouvé avec cet email');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 heure

    user.passwordResetToken = resetToken;
    user.passwordResetExpiry = resetTokenExpiry;

    await user.save();

    // Envoi d'email de réinitialisation (à implémenter)
    // await this.sendPasswordResetEmail(email, resetToken);

    return { message: 'Email de réinitialisation envoyé' };
  }

  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Token invalide ou expiré');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;

    await user.save();

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  // Génération de JWT
  generateJWT(user) {
    return jwt.sign(
      { 
        id: user._id, 
        username: user.username,
        role: user.role || 'user'
      }, 
      this.JWT_SECRET, 
      { expiresIn: '7d' }
    );
  }

  // Génération de token d'activation
  generateActivationToken(user) {
    return jwt.sign(
      { id: user._id }, 
      this.JWT_SECRET, 
      { expiresIn: '24h' }
    );
  }

  // Middleware de vérification JWT
  verifyJWT(token) {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Token invalide');
    }
  }

  // Nettoyage des données utilisateur
  sanitizeUser(user) {
    const { password, twoFactorSecret, ...sanitizedUser } = user.toObject();
    return sanitizedUser;
  }

  // Activation du compte
  async activateAccount(token) {
    try {
      const decoded = this.verifyJWT(token);
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      user.status = 'active';
      await user.save();

      return { message: 'Compte activé avec succès' };
    } catch (error) {
      throw new Error(`Erreur d'activation : ${error.message}`);
    }
  }
}

module.exports = new AuthService();
