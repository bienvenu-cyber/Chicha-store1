const express = import('express');
const router = express.Router();
const MobilePaymentController = import('../controllers/mobilePaymentController');
const AuthMiddleware = import('../middleware/authMiddleware');

// Routes pour les paiements mobile money

// Récupérer les opérateurs disponibles
router.get('/providers', 
  AuthMiddleware.authenticateToken,
  MobilePaymentController.getSupportedProviders
);

// Initier un paiement mobile
router.post('/initiate', 
  AuthMiddleware.authenticateToken,
  MobilePaymentController.initiatePayment
);

// Vérifier le statut d'un paiement
router.get('/status', 
  AuthMiddleware.authenticateToken,
  MobilePaymentController.checkPaymentStatus
);

// Webhook pour les notifications de paiement
router.post('/webhook/:provider', 
  MobilePaymentController.handleProviderWebhook
);

// Remboursement
router.post('/refund', 
  AuthMiddleware.authenticateToken,
  AuthMiddleware.checkRole(['admin', 'support']),
  MobilePaymentController.refundPayment
);

export default = router;
