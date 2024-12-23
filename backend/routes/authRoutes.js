const express = require('express');
const AuthService = require('../services/authService');
const AuthMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Route d'inscription
router.post('/register', async (req, res) => {
  try {
    const userData = req.body;
    const result = await AuthService.register(userData);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ 
      message: 'Erreur d\'inscription', 
      error: error.message 
    });
  }
});

// Route de connexion
router.post('/login', 
  AuthMiddleware.rateLimitLogin,
  AuthMiddleware.checkAccountIntegrity,
  async (req, res) => {
    try {
      const credentials = req.body;
      const result = await AuthService.login(credentials);
      
      if (result.twoFactorRequired) {
        return res.status(206).json({
          message: 'Authentification à deux facteurs requise',
          userId: result.userId
        });
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(401).json({ 
        message: 'Échec de la connexion', 
        error: error.message 
      });
    }
});

// Route de vérification 2FA
router.post('/verify-2fa', async (req, res) => {
  try {
    const { userId, code } = req.body;
    const result = await AuthService.verifyTwoFactor(userId, code);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ 
      message: 'Vérification 2FA échouée', 
      error: error.message 
    });
  }
});

// Route de réinitialisation de mot de passe
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await AuthService.initiatePasswordReset(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ 
      message: 'Erreur de réinitialisation de mot de passe', 
      error: error.message 
    });
  }
});

// Route de réinitialisation de mot de passe
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await AuthService.resetPassword(token, newPassword);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ 
      message: 'Échec de la réinitialisation de mot de passe', 
      error: error.message 
    });
  }
});

// Route d'activation de compte
router.get('/activate/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const result = await AuthService.activateAccount(token);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ 
      message: 'Activation du compte échouée', 
      error: error.message 
    });
  }
});

// Route de profil utilisateur (protégée)
router.get('/profile', 
  AuthMiddleware.authenticateJWT,
  async (req, res) => {
    try {
      const user = req.user;
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur de récupération du profil', 
        error: error.message 
      });
    }
});

// Route de mise à jour du profil (protégée)
router.put('/profile', 
  AuthMiddleware.authenticateJWT,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const updateData = req.body;
      
      const updatedUser = await User.findByIdAndUpdate(
        userId, 
        updateData, 
        { new: true }
      );

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(400).json({ 
        message: 'Mise à jour du profil échouée', 
        error: error.message 
      });
    }
});

module.exports = router;
