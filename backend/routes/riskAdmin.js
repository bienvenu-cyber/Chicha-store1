import express from 'express';
const router = express.Router();
import RiskAdminController from '../controllers/riskAdminController.js.js';
import AuthMiddleware from '../middleware/authMiddleware.js.js';
import RoleMiddleware from '../middleware/roleMiddleware.js.js';

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

export default router;
