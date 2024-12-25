import AdminAuthService from '../services/adminAuthService.js.js';
import AdminStatsService from '../services/adminStatsService.js.js';

class AdminController {
  // Inscription admin
  async register(req, res) {
    try {
      const adminData = req.body;
      const admin = await AdminAuthService.createAdmin(adminData);
      
      res.status(201).json({
        message: 'Admin créé avec succès',
        admin
      });
    } catch (error) {
      res.status(400).json({ 
        message: 'Erreur lors de la création de l\'admin',
        error: error.message 
      });
    }
  }

  // Connexion admin
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AdminAuthService.loginAdmin(email, password);
      
      res.status(200).json({
        message: 'Connexion réussie',
        ...result
      });
    } catch (error) {
      res.status(401).json({ 
        message: 'Échec de la connexion',
        error: error.message 
      });
    }
  }

  // Configuration 2FA
  async setupTwoFactor(req, res) {
    try {
      const adminId = req.user.id;
      const twoFactorSetup = await AdminAuthService.setupTwoFactor(adminId);
      
      res.status(200).json({
        message: 'Configuration 2FA initialisée',
        ...twoFactorSetup
      });
    } catch (error) {
      res.status(400).json({ 
        message: 'Erreur de configuration 2FA',
        error: error.message 
      });
    }
  }

  // Vérification 2FA
  async verifyTwoFactor(req, res) {
    try {
      const adminId = req.user.id;
      const { token } = req.body;
      
      await AdminAuthService.verifyTwoFactor(adminId, token);
      
      res.status(200).json({
        message: '2FA activé avec succès'
      });
    } catch (error) {
      res.status(400).json({ 
        message: 'Échec de la vérification 2FA',
        error: error.message 
      });
    }
  }

  // Initiation de la réinitialisation de mot de passe
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const resetToken = await AdminAuthService.initiatePasswordReset(email);
      
      res.status(200).json({
        message: 'Email de réinitialisation envoyé',
        resetToken // À des fins de test, en production, ne renvoyez JAMAIS ce token
      });
    } catch (error) {
      res.status(400).json({ 
        message: 'Erreur lors de la réinitialisation du mot de passe',
        error: error.message 
      });
    }
  }

  // Réinitialisation finale du mot de passe
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      
      await AdminAuthService.resetPassword(token, newPassword);
      
      res.status(200).json({
        message: 'Mot de passe réinitialisé avec succès'
      });
    } catch (error) {
      res.status(400).json({ 
        message: 'Échec de la réinitialisation du mot de passe',
        error: error.message 
      });
    }
  }

  // Tableau de bord admin
  async getDashboardStats(req, res) {
    try {
      const adminId = req.user.id;
      const stats = await AdminStatsService.getDashboardStats(adminId);
      
      res.status(200).json({
        message: 'Statistiques récupérées',
        stats
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des statistiques',
        error: error.message 
      });
    }
  }

  // Gestion des permissions
  async updatePermissions(req, res) {
    try {
      const { adminId, permissions } = req.body;
      const updatedAdmin = await AdminStatsService.updateAdminPermissions(
        req.user.id, // Admin qui effectue la modification
        adminId, 
        permissions
      );
      
      res.status(200).json({
        message: 'Permissions mises à jour',
        admin: updatedAdmin
      });
    } catch (error) {
      res.status(403).json({ 
        message: 'Mise à jour des permissions refusée',
        error: error.message 
      });
    }
  }
}

export default new AdminController();
