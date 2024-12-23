const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('paypal-rest-sdk');
const { Order } = require('../models/Order');
const { TransactionRisk } = require('../models/TransactionRisk');
const PaymentIntegrationService = require('../services/paymentIntegrationService');

// Configuration des services de paiement
paypal.configure({
  'mode': process.env.PAYPAL_MODE, 
  'client_id': process.env.PAYPAL_CLIENT_ID,
  'client_secret': process.env.PAYPAL_CLIENT_SECRET
});

class PaymentController {
  // Point d'entrée unifié pour tous les paiements
  async processPayment(req, res) {
    const { 
      orderId, 
      paymentMethod, 
      paymentDetails 
    } = req.body;

    // Utiliser la validation précédente
    const paymentValidation = req.paymentValidation;

    try {
      // Récupérer la commande
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }

      // Traitement basé sur la méthode de paiement
      let paymentResult;
      switch (paymentMethod) {
        case 'stripe':
          paymentResult = await this.processStripePayment(
            order, 
            paymentDetails, 
            paymentValidation
          );
          break;
        case 'paypal':
          paymentResult = await this.processPayPalPayment(
            order, 
            paymentDetails, 
            paymentValidation
          );
          break;
        case 'mobile_money':
          paymentResult = await this.processMobileMoneyPayment(
            order, 
            paymentDetails, 
            paymentValidation
          );
          break;
        case 'crypto':
          paymentResult = await this.processCryptoPayment(
            order, 
            paymentDetails, 
            paymentValidation
          );
          break;
        default:
          return res.status(400).json({ error: 'Méthode de paiement non supportée' });
      }

      // Mise à jour de la commande
      order.paymentStatus = paymentResult.status;
      order.transactionId = paymentResult.transactionId;
      await order.save();

      res.json({
        message: 'Paiement traité avec succès',
        paymentResult
      });
    } catch (error) {
      console.error('Erreur de traitement de paiement', error);
      res.status(500).json({ 
        error: 'Échec du traitement du paiement',
        details: error.message 
      });
    }
  }

  // Traitement Stripe
  async processStripePayment(order, paymentDetails, paymentValidation) {
    if (paymentValidation.status === 'REVIEW') {
      // Nécessite une vérification manuelle
      return {
        status: 'pending',
        transactionId: paymentValidation.riskRecord._id
      };
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.totalAmount * 100, // En centimes
      currency: order.currency,
      payment_method: paymentDetails.paymentMethodId,
      confirm: true
    });

    return {
      status: paymentIntent.status === 'succeeded' ? 'completed' : 'failed',
      transactionId: paymentIntent.id
    };
  }

  // Traitement PayPal
  async processPayPalPayment(order, paymentDetails, paymentValidation) {
    if (paymentValidation.status === 'REVIEW') {
      return {
        status: 'pending',
        transactionId: paymentValidation.riskRecord._id
      };
    }

    return new Promise((resolve, reject) => {
      const paymentData = {
        "intent": "sale",
        "payer": { "payment_method": "paypal" },
        "transactions": [{
          "amount": {
            "total": order.totalAmount,
            "currency": order.currency
          }
        }],
        "redirect_urls": {
          "return_url": `${process.env.FRONTEND_URL}/payment/success`,
          "cancel_url": `${process.env.FRONTEND_URL}/payment/cancel`
        }
      };

      paypal.payment.create(paymentData, (error, payment) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            status: payment.state === 'created' ? 'initiated' : 'failed',
            transactionId: payment.id
          });
        }
      });
    });
  }

  // Traitement Mobile Money
  async processMobileMoneyPayment(order, paymentDetails, paymentValidation) {
    if (paymentValidation.status === 'REVIEW') {
      return {
        status: 'pending',
        transactionId: paymentValidation.riskRecord._id
      };
    }

    // Logique spécifique à l'opérateur mobile money
    const mobileMoneyTransaction = await MobileMoneyService.initiatePayment(
      order, 
      paymentDetails.phoneNumber, 
      paymentDetails.provider
    );

    return {
      status: mobileMoneyTransaction.status,
      transactionId: mobileMoneyTransaction.transactionId
    };
  }

  // Traitement Crypto
  async processCryptoPayment(order, paymentDetails, paymentValidation) {
    if (paymentValidation.status === 'REVIEW') {
      return {
        status: 'pending',
        transactionId: paymentValidation.riskRecord._id
      };
    }

    const cryptoTransaction = await CryptoService.createCharge(
      order, 
      paymentDetails.cryptocurrency
    );

    return {
      status: cryptoTransaction.status,
      transactionId: cryptoTransaction.chargeId
    };
  }

  // Webhook pour les notifications de paiement
  async handlePaymentWebhook(req, res) {
    const { type, data } = req.body;

    try {
      switch (type) {
        case 'payment_intent.succeeded':
          await this.handleStripeSuccess(data.object);
          break;
        case 'paypal.payment.completed':
          await this.handlePayPalSuccess(data.object);
          break;
        // Autres webhooks...
      }

      res.status(200).send('Webhook reçu');
    } catch (error) {
      console.error('Erreur de webhook', error);
      res.status(500).send('Erreur de traitement');
    }
  }

  // Gestion des succès de paiement
  async handleStripeSuccess(paymentIntent) {
    const order = await Order.findOne({ 
      transactionId: paymentIntent.id 
    });

    if (order) {
      order.paymentStatus = 'completed';
      await order.save();
    }
  }

  async handlePayPalSuccess(payment) {
    const order = await Order.findOne({ 
      transactionId: payment.id 
    });

    if (order) {
      order.paymentStatus = 'completed';
      await order.save();
    }
  }

  // Nouvelle méthode pour les portefeuilles électroniques
  async processDigitalWalletPayment(req, res) {
    try {
      const { 
        orderId, 
        walletType, 
        walletToken 
      } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }

      const paymentResult = await PaymentIntegrationService.processDigitalWalletPayment(
        order, 
        { 
          type: walletType, 
          token: walletToken 
        }
      );

      order.paymentStatus = paymentResult.status;
      order.transactionId = paymentResult.transactionId;
      await order.save();

      res.json({
        message: 'Paiement par portefeuille électronique réussi',
        paymentResult
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Échec du paiement par portefeuille électronique',
        details: error.message 
      });
    }
  }

  // Méthode pour les paiements mobiles régionaux
  async processRegionalMobilePayment(req, res) {
    try {
      const { 
        orderId, 
        paymentType, 
        phoneNumber 
      } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }

      const paymentResult = await PaymentIntegrationService.processRegionalPayment(
        order, 
        { 
          type: paymentType, 
          phoneNumber 
        }
      );

      order.paymentStatus = paymentResult.status;
      order.transactionId = paymentResult.transactionId;
      await order.save();

      res.json({
        message: 'Paiement mobile régional réussi',
        paymentResult
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Échec du paiement mobile régional',
        details: error.message 
      });
    }
  }

  // Méthode pour les paiements par cryptomonnaie
  async processCryptoPayment(req, res) {
    try {
      const { 
        orderId, 
        cryptoType 
      } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }

      const paymentResult = await PaymentIntegrationService.processCryptoCoinbase(
        order, 
        { type: cryptoType }
      );

      order.paymentStatus = paymentResult.status;
      order.transactionId = paymentResult.chargeId;
      await order.save();

      res.json({
        message: 'Charge crypto créée avec succès',
        paymentResult
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Échec de la création de charge crypto',
        details: error.message 
      });
    }
  }

  // Conversion de devise en temps réel
  async convertCurrency(req, res) {
    try {
      const { 
        amount, 
        fromCurrency, 
        toCurrency 
      } = req.body;

      const convertedAmount = await PaymentIntegrationService.convertCurrency(
        amount, 
        fromCurrency, 
        toCurrency
      );

      res.json({
        originalAmount: amount,
        convertedAmount,
        fromCurrency,
        toCurrency
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Échec de la conversion de devise',
        details: error.message 
      });
    }
  }

  // Méthodes manquantes
  async createStripePaymentIntent(req, res) {
    try {
      const { orderId } = req.body;
      const order = await Order.findById(orderId);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.totalAmount * 100),
        currency: order.currency
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createPayPalOrder(req, res) {
    try {
      const { orderId } = req.body;
      const order = await Order.findById(orderId);

      const paypalOrder = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: order.currency,
            value: order.totalAmount.toString()
          }
        }]
      };

      const response = await paypal.v1.payments.create(paypalOrder);
      
      res.json({ 
        orderID: response.id 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async initiateMobileMoneyPayment(req, res) {
    try {
      const { orderId, phoneNumber, provider } = req.body;
      const order = await Order.findById(orderId);

      const mobileMoneyTransaction = await MobileMoneyService.initiatePayment(
        order, 
        phoneNumber, 
        provider
      );

      res.json(mobileMoneyTransaction);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createCryptoCharge(req, res) {
    try {
      const { orderId, cryptoType } = req.body;
      const order = await Order.findById(orderId);

      const cryptoCharge = await CryptoService.createCharge(
        order, 
        cryptoType
      );

      res.json(cryptoCharge);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Méthodes supplémentaires
  async processDigitalWalletPayment(req, res) {
    try {
      const { 
        orderId, 
        walletType, 
        walletDetails 
      } = req.body;

      const order = await Order.findById(orderId);
      const digitalWalletTransaction = await PaymentIntegrationService.processDigitalWallet(
        order, 
        walletType, 
        walletDetails
      );

      res.json(digitalWalletTransaction);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async processRegionalMobilePayment(req, res) {
    try {
      const { 
        orderId, 
        region, 
        phoneNumber 
      } = req.body;

      const order = await Order.findById(orderId);
      const regionalMobileTransaction = await PaymentIntegrationService.processRegionalMobileMoney(
        order, 
        region, 
        phoneNumber
      );

      res.json(regionalMobileTransaction);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async handlePaymentWebhook(req, res) {
    const { provider } = req.params;
    const payload = req.body;

    try {
      switch(provider) {
        case 'stripe':
          await this.handleStripeWebhook(payload);
          break;
        case 'paypal':
          await this.handlePayPalWebhook(payload);
          break;
        case 'mobile-money':
          await this.handleMobileMoneyWebhook(payload);
          break;
        case 'crypto':
          await this.handleCryptoWebhook(payload);
          break;
        default:
          throw new Error('Provider non supporté');
      }

      res.status(200).json({ status: 'webhook traité' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async handleStripeWebhook(payload) {
    // Logique de traitement du webhook Stripe
    const event = payload;
    // Vérifier la signature du webhook
    // Gérer différents types d'événements Stripe
  }

  async handlePayPalWebhook(payload) {
    // Logique de traitement du webhook PayPal
    const event = payload;
    // Vérifier la signature du webhook
    // Gérer différents types d'événements PayPal
  }

  async handleMobileMoneyWebhook(payload) {
    // Logique de traitement du webhook Mobile Money
    const event = payload;
    // Vérifier la signature du webhook
    // Gérer différents types d'événements Mobile Money
  }

  async handleCryptoWebhook(payload) {
    // Logique de traitement du webhook Crypto
    const event = payload;
    // Vérifier la signature du webhook
    // Gérer différents types d'événements Crypto
  }
}

module.exports = new PaymentController();
