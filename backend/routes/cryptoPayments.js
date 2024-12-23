const express = require('express');
const router = express.Router();
const CryptoPayment = require('../models/CryptoPayment');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

// Service pour obtenir les taux de change (à remplacer par une vraie API)
const getCryptoRate = async (crypto) => {
    const rates = {
        'BTC': 43000,
        'ETH': 2200,
        'USDT': 1,
        'BNB': 250
    };
    return rates[crypto];
};

// Initialiser un paiement crypto
router.post('/initiate', auth, async (req, res) => {
    try {
        const { orderId, cryptocurrency } = req.body;
        
        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id,
            paymentStatus: 'pending'
        });

        if (!order) {
            return res.status(404).send({ error: 'Commande non trouvée' });
        }

        // Obtenir le taux de change actuel
        const rate = await getCryptoRate(cryptocurrency);
        const amountCrypto = order.totalAmount / rate;

        // Générer une adresse de portefeuille unique (à implémenter avec un vrai service)
        const walletAddress = `${cryptocurrency}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        const payment = new CryptoPayment({
            order: order._id,
            cryptocurrency,
            walletAddress,
            amountCrypto,
            amountFiat: order.totalAmount,
            exchangeRate: rate
        });

        await payment.save();

        res.status(201).json({
            payment,
            instructions: {
                amount: amountCrypto,
                currency: cryptocurrency,
                address: walletAddress,
                message: `Envoyez exactement ${amountCrypto} ${cryptocurrency} à l'adresse suivante`
            }
        });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Webhook pour les confirmations de transactions (à intégrer avec un vrai service blockchain)
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    try {
        const { transactionHash, address, amount, confirmations } = req.body;

        const payment = await CryptoPayment.findOne({ walletAddress: address });
        if (!payment) {
            return res.status(404).send({ error: 'Paiement non trouvé' });
        }

        payment.transactionHash = transactionHash;
        payment.confirmations = confirmations;

        if (confirmations >= 3) { // Nombre de confirmations requis
            payment.status = 'completed';
            
            // Mettre à jour le statut de la commande
            await Order.findByIdAndUpdate(payment.order, {
                paymentStatus: 'completed',
                status: 'processing'
            });
        } else {
            payment.status = 'confirming';
        }

        await payment.save();
        res.json({ received: true });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Vérifier le statut d'un paiement
router.get('/status/:walletAddress', auth, async (req, res) => {
    try {
        const payment = await CryptoPayment.findOne({
            walletAddress: req.params.walletAddress
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
