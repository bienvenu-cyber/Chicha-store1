import express from 'express';
const router = express.Router();
import MobilePaymentController from '../controllers/mobilePaymentController.js.js';
import AuthMiddleware from '../middleware/authMiddleware.js.js';

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

export default router;
