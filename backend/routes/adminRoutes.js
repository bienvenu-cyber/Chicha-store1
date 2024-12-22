const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

const router = express.Router();

// Routes publiques
router.post('/register', 
  validationMiddleware.validateAdminRegistration,
  adminController.register
);

router.post('/login', 
  validationMiddleware.validateAdminLogin,
  adminController.login
);

router.post('/forgot-password', 
  validationMiddleware.validateForgotPassword,
  adminController.forgotPassword
);

router.post('/reset-password', 
  validationMiddleware.validateResetPassword,
  adminController.resetPassword
);

// Routes protégées
router.use(authMiddleware.requireAdminAuth);

// Configuration 2FA
router.post('/setup-2fa', 
  adminController.setupTwoFactor
);

router.post('/verify-2fa', 
  validationMiddleware.validateTwoFactorToken,
  adminController.verifyTwoFactor
);

// Tableau de bord et statistiques
router.get('/dashboard', 
  permissionMiddleware.checkDashboardAccess,
  adminController.getDashboardStats
);

// Gestion des permissions
router.put('/permissions', 
  permissionMiddleware.requireSuperAdminRole,
  validationMiddleware.validatePermissionUpdate,
  adminController.updatePermissions
);

// Routes spécifiques aux rôles
router.get('/produits', 
  permissionMiddleware.checkProductManagementAccess,
  adminController.getProductManagementData
);

router.get('/utilisateurs', 
  permissionMiddleware.checkUserManagementAccess,
  adminController.getUserManagementData
);

router.get('/commandes', 
  permissionMiddleware.checkOrderManagementAccess,
  adminController.getOrderManagementData
);

router.get('/marketing', 
  permissionMiddleware.checkMarketingAccess,
  adminController.getMarketingData
);

router.get('/finance', 
  permissionMiddleware.checkFinanceAccess,
  adminController.getFinanceData
);

module.exports = router;
