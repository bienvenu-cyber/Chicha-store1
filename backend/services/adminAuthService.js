const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

class AdminAuthService {
  // Création d'un compte admin
  async createAdmin(adminData) {
    try {
      const existingAdmin = await Admin.findOne({
        $or: [
          { email: adminData.email },
          { username: adminData.username }
        ]
      });

      if (existingAdmin) {
        throw new Error('Un admin avec cet email ou username existe déjà');
      }

      const admin = new Admin(adminData);
      await admin.save();

      return this.sanitizeAdmin(admin);
    } catch (error) {
      throw new Error(`Erreur de création d'admin : ${error.message}`);
    }
  }

  // Connexion admin
  async loginAdmin(email, password) {
    try {
      const admin = await Admin.findOne({ email });

      if (!admin) {
        throw new Error('Admin non trouvé');
      }

      // Vérification du compte verrouillé
      if (admin.isLocked && admin.lockUntil > Date.now()) {
        throw new Error('Compte verrouillé. Réessayez plus tard.');
      }

      // Vérification du mot de passe
      const isMatch = await admin.comparePassword(password);

      if (!isMatch) {
        await admin.incrementLoginAttempts();
        throw new Error('Mot de passe incorrect');
      }

      // Réinitialisation des tentatives de connexion
      await admin.resetLoginAttempts();

      // Génération du token
      const token = this.generateJWT(admin);

      // Mise à jour de la dernière connexion
      admin.lastLogin = new Date();
      await admin.save();

      return {
        token,
        admin: this.sanitizeAdmin(admin)
      };
    } catch (error) {
      throw new Error(`Erreur de connexion : ${error.message}`);
    }
  }

  // Génération de JWT
  generateJWT(admin) {
    return jwt.sign(
      { 
        id: admin._id, 
        role: admin.role,
        permissions: admin.permissions
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
  }

  // Configuration 2FA
  async setupTwoFactor(adminId) {
    try {
      const admin = await Admin.findById(adminId);

      if (!admin) {
        throw new Error('Admin non trouvé');
      }

      // Génération de la clé secrète
      const secret = speakeasy.generateSecret({ 
        name: `ChichaStore:${admin.email}` 
      });

      // Mise à jour de l'admin
      admin.twoFactorSecret = secret.base32;
      await admin.save();

      // Génération du QR Code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      return {
        secret: secret.base32,
        qrCodeUrl
      };
    } catch (error) {
      throw new Error(`Erreur de configuration 2FA : ${error.message}`);
    }
  }

  // Vérification 2FA
  async verifyTwoFactor(adminId, token) {
    try {
      const admin = await Admin.findById(adminId);

      if (!admin || !admin.twoFactorSecret) {
        throw new Error('Configuration 2FA requise');
      }

      const verified = speakeasy.totp.verify({
        secret: admin.twoFactorSecret,
        encoding: 'base32',
        token: token
      });

      if (!verified) {
        throw new Error('Token 2FA invalide');
      }

      // Activation de 2FA
      admin.twoFactorEnabled = true;
      await admin.save();

      return true;
    } catch (error) {
      throw new Error(`Erreur de vérification 2FA : ${error.message}`);
    }
  }

  // Réinitialisation de mot de passe
  async initiatePasswordReset(email) {
    try {
      const admin = await Admin.findOne({ email });

      if (!admin) {
        throw new Error('Aucun admin trouvé avec cet email');
      }

      // Génération du token de réinitialisation
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = Date.now() + 3600000; // 1 heure

      admin.resetPasswordToken = resetToken;
      admin.resetPasswordExpires = resetTokenExpiry;
      await admin.save();

      // TODO: Envoyer un email avec le lien de réinitialisation
      return resetToken;
    } catch (error) {
      throw new Error(`Erreur de réinitialisation de mot de passe : ${error.message}`);
    }
  }

  // Réinitialisation finale du mot de passe
  async resetPassword(token, newPassword) {
    try {
      const admin = await Admin.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!admin) {
        throw new Error('Token de réinitialisation invalide ou expiré');
      }

      admin.password = newPassword;
      admin.resetPasswordToken = null;
      admin.resetPasswordExpires = null;

      await admin.save();

      return true;
    } catch (error) {
      throw new Error(`Erreur de réinitialisation de mot de passe : ${error.message}`);
    }
  }

  // Nettoyage des données admin
  sanitizeAdmin(admin) {
    const sanitized = admin.toObject();
    delete sanitized.password;
    delete sanitized.twoFactorSecret;
    delete sanitized.resetPasswordToken;
    return sanitized;
  }
}

module.exports = new AdminAuthService();
