const express = require('express');
const router = express.Router();
const RiskAdminController = require('../controllers/riskAdminController');
const AuthMiddleware = require('../middleware/authMiddleware');
const RoleMiddleware = require('../middleware/roleMiddleware');

// Middleware pour s'assurer que seuls les administrateurs peuvent accéder
const adminOnly = [
  AuthMiddleware.authenticateToken,
  RoleMiddleware.requireRole(['ADMIN', 'COMPLIANCE_OFFICER'])
];

// Règles de risque personnalisées
router.post('/custom-rules', 
  ...adminOnly,
  RiskAdminController.createCustomRiskRule
);

router.put('/custom-rules/:ruleId', 
  ...adminOnly,
  RiskAdminController.updateCustomRiskRule
);

router.delete('/custom-rules/:ruleId', 
  ...adminOnly,
  RiskAdminController.disableCustomRiskRule
);

router.get('/custom-rules', 
  ...adminOnly,
  RiskAdminController.getAllCustomRiskRules
);

// Tableau de bord et analyse des risques
router.get('/dashboard', 
  ...adminOnly,
  RiskAdminController.getTransactionRiskDashboard
);

router.get('/transaction/:transactionId', 
  ...adminOnly,
  RiskAdminController.analyzeSpecificTransaction
);

module.exports = router;
