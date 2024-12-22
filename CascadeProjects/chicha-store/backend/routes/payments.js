const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { auth } = require('../middleware/auth');
const Order = require('../models/Order');

// Créer une intention de paiement
router.post('/create-payment-intent', auth, async (req, res) => {
    try {
        const { orderId } = req.body;
        
        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id,
            paymentStatus: 'pending'
        });

        if (!order) {
            return res.status(404).send({ error: 'Commande non trouvée' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(order.totalAmount * 100), // Stripe utilise les centimes
            currency: 'eur',
            metadata: {
                orderId: order._id.toString(),
                userId: req.user._id.toString()
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Webhook pour gérer les événements Stripe
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Gérer l'événement
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            const orderId = paymentIntent.metadata.orderId;
            
            // Mettre à jour le statut de la commande
            await Order.findByIdAndUpdate(orderId, {
                paymentStatus: 'completed',
                status: 'processing'
            });
            break;
            
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            const failedOrderId = failedPayment.metadata.orderId;
            
            // Mettre à jour le statut de la commande
            await Order.findByIdAndUpdate(failedOrderId, {
                paymentStatus: 'failed'
            });
            break;
    }

    res.json({received: true});
});

module.exports = router;
