const express = import('express');
const router = express.Router();
const PaymentController = import('../controllers/paymentController');
const PaymentValidationMiddleware = import('../middleware/paymentValidationMiddleware');
const AuthMiddleware = import('../middleware/authMiddleware');

// Route unifiée de traitement de paiement
router.post('/process', 
  AuthMiddleware.authenticateToken,
  PaymentValidationMiddleware.validatePayment,
  PaymentValidationMiddleware.validateSpecificPaymentMethod,
  PaymentController.processPayment
);

// Webhook pour les notifications de paiement
router.post('/webhook/:provider', 
  PaymentController.handlePaymentWebhook
);

// Routes spécifiques aux méthodes de paiement
router.post('/stripe/create-intent', 
  AuthMiddleware.authenticateToken,
  PaymentController.createStripePaymentIntent
);

router.post('/paypal/create-order', 
  AuthMiddleware.authenticateToken,
  PaymentController.createPayPalOrder
);

router.post('/mobile-money/initiate', 
  AuthMiddleware.authenticateToken,
  PaymentController.initiateMobileMoneyPayment
);

router.post('/crypto/create-charge', 
  AuthMiddleware.authenticateToken,
  PaymentController.createCryptoCharge
);

// Nouvelles routes pour les méthodes de paiement
router.post('/digital-wallet', 
  AuthMiddleware.authenticateToken,
  PaymentValidationMiddleware.validatePayment,
  PaymentController.processDigitalWalletPayment
);

router.post('/regional-mobile', 
  AuthMiddleware.authenticateToken,
  PaymentValidationMiddleware.validatePayment,
  PaymentController.processRegionalMobilePayment
);

router.post('/crypto', 
  AuthMiddleware.authenticateToken,
  PaymentValidationMiddleware.validatePayment,
  PaymentController.processCryptoPayment
);

router.post('/convert-currency', 
  AuthMiddleware.authenticateToken,
  PaymentController.convertCurrency
);

// Routes de vérification de statut
router.get('/status/:transactionId', 
  AuthMiddleware.authenticateToken,
  PaymentController.checkPaymentStatus
);

export default = router;
