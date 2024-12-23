const MobileMoneyService = require('../services/mobileMoney');
const OrderService = require('../services/orderService');
const { Order } = require('../models/Order');

class MobilePaymentController {
  // Liste des opérateurs disponibles
  async getSupportedProviders(req, res) {
    try {
      const providers = MobileMoneyService.getSupportedProviders();
      res.json({
        message: 'Opérateurs mobile money disponibles',
        providers
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Impossible de récupérer les opérateurs',
        details: error.message 
      });
    }
  }

  // Initier un paiement mobile
  async initiatePayment(req, res) {
    try {
      const { 
        orderId, 
        phoneNumber, 
        provider 
      } = req.body;

      // Récupérer la commande
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ 
          error: 'Commande non trouvée' 
        });
      }

      // Vérifier que la commande appartient à l'utilisateur
      if (order.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          error: 'Accès non autorisé à cette commande' 
        });
      }

      // Initier le paiement
      const paymentResult = await MobileMoneyService.initiatePayment(
        order, 
        phoneNumber, 
        provider
      );

      res.json({
        message: 'Paiement mobile initié',
        transaction: paymentResult
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Échec de l\'initialisation du paiement',
        details: error.message 
      });
    }
  }

  // Vérifier le statut d'un paiement
  async checkPaymentStatus(req, res) {
    try {
      const { 
        orderId, 
        provider 
      } = req.query;

      // Récupérer la commande
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ 
          error: 'Commande non trouvée' 
        });
      }

      // Vérifier que la commande appartient à l'utilisateur
      if (order.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          error: 'Accès non autorisé à cette commande' 
        });
      }

      // Vérifier le statut du paiement
      const statusResult = await MobileMoneyService.checkPaymentStatus(
        order, 
        provider
      );

      res.json({
        message: 'Statut du paiement mobile',
        status: statusResult
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Impossible de vérifier le statut du paiement',
        details: error.message 
      });
    }
  }

  // Webhook pour les notifications de paiement
  async handleProviderWebhook(req, res) {
    try {
      const { provider } = req.params;
      const webhookData = req.body;

      // Validation de base
      if (!webhookData.transactionId || !webhookData.status) {
        return res.status(400).json({ 
          error: 'Données de webhook invalides' 
        });
      }

      // Rechercher la commande associée
      const order = await Order.findOne({
        'mobileMoneyTransaction.transactionId': webhookData.transactionId,
        'mobileMoneyTransaction.provider': provider
      });

      if (!order) {
        return res.status(404).json({ 
          error: 'Commande associée non trouvée' 
        });
      }

      // Mettre à jour le statut de la commande
      if (webhookData.status === 'success') {
        order.status = 'paid';
        order.mobileMoneyTransaction.status = 'completed';
        await order.save();

        // Notification à l'utilisateur
        await NotificationService.sendOrderPaymentConfirmation(
          order.userId, 
          order
        );
      } else if (webhookData.status === 'failed') {
        order.status = 'payment_failed';
        order.mobileMoneyTransaction.status = 'failed';
        await order.save();

        // Notification d'échec
        await NotificationService.sendOrderPaymentFailure(
          order.userId, 
          order
        );
      }

      res.status(200).json({ 
        message: 'Webhook traité avec succès' 
      });
    } catch (error) {
      console.error('Erreur de traitement webhook', error);
      res.status(500).json({ 
        error: 'Erreur de traitement du webhook',
        details: error.message 
      });
    }
  }

  // Remboursement via mobile money
  async refundPayment(req, res) {
    try {
      const { 
        orderId, 
        reason 
      } = req.body;

      // Récupérer la commande
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ 
          error: 'Commande non trouvée' 
        });
      }

      // Vérifier les conditions de remboursement
      if (order.status !== 'paid') {
        return res.status(400).json({ 
          error: 'Remboursement impossible' 
        });
      }

      // Initier le remboursement
      const refundResult = await MobileMoneyService.refundPayment(
        order, 
        reason
      );

      res.json({
        message: 'Remboursement initié',
        refund: refundResult
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Échec du remboursement',
        details: error.message 
      });
    }
  }
}

module.exports = new MobilePaymentController();
