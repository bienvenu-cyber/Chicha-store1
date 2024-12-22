const express = require('express');
const router = express.Router();
const MobilePayment = require('../models/MobilePayment');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

// Initialiser un paiement mobile
router.post('/initiate', auth, async (req, res) => {
    try {
        const { orderId, provider, phoneNumber } = req.body;
        
        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id,
            paymentStatus: 'pending'
        });

        if (!order) {
            return res.status(404).send({ error: 'Commande non trouvée' });
        }

        // Simuler l'intégration avec les API des opérateurs mobiles
        const payment = new MobilePayment({
            order: order._id,
            provider,
            phoneNumber,
            amount: order.totalAmount,
            transactionId: `${provider.toUpperCase()}_${Date.now()}`
        });

        await payment.save();

        // Simuler l'envoi d'un code USSD ou SMS
        const ussdCode = provider === 'mtn' ? '*133#' :
                        provider === 'orange' ? '*144#' :
                        '*155#'; // moov

        res.status(201).json({
            payment,
            nextStep: `Composez ${ussdCode} sur votre téléphone pour confirmer le paiement de ${order.totalAmount} FCFA`
        });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Confirmer un paiement mobile
router.post('/confirm', auth, async (req, res) => {
    try {
        const { transactionId, confirmationCode } = req.body;
        
        const payment = await MobilePayment.findOne({ transactionId });
        if (!payment) {
            return res.status(404).send({ error: 'Paiement non trouvé' });
        }

        // Simuler la vérification du code
        if (confirmationCode.length !== 6) {
            return res.status(400).send({ error: 'Code de confirmation invalide' });
        }

        payment.status = 'completed';
        payment.confirmationCode = confirmationCode;
        payment.paymentDate = new Date();
        await payment.save();

        // Mettre à jour le statut de la commande
        await Order.findByIdAndUpdate(payment.order, {
            paymentStatus: 'completed',
            status: 'processing'
        });

        res.json({
            message: 'Paiement confirmé avec succès',
            payment
        });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Vérifier le statut d'un paiement
router.get('/status/:transactionId', auth, async (req, res) => {
    try {
        const payment = await MobilePayment.findOne({
            transactionId: req.params.transactionId
        }).populate('order');
        
        if (!payment) {
            return res.status(404).send({ error: 'Paiement non trouvé' });
        }

        res.json(payment);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
