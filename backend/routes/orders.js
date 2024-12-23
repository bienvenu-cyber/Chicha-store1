const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');

// Créer une nouvelle commande
router.post('/', auth, async (req, res) => {
    try {
        // Vérifier le stock et calculer le montant total
        let totalAmount = 0;
        for (const item of req.body.items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).send({ error: 'Produit non trouvé' });
            }
            if (product.stock < item.quantity) {
                return res.status(400).send({ error: 'Stock insuffisant' });
            }
            totalAmount += product.price * item.quantity;
            
            // Mettre à jour le stock
            product.stock -= item.quantity;
            await product.save();
        }

        const order = new Order({
            ...req.body,
            user: req.user._id,
            totalAmount
        });

        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Obtenir toutes les commandes d'un utilisateur
router.get('/my-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Obtenir une commande spécifique
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('items.product');
        
        if (!order) return res.status(404).send();
        res.json(order);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Mettre à jour le statut d'une commande (admin seulement)
router.patch('/:id', adminAuth, async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { 
                status: req.body.status,
                trackingNumber: req.body.trackingNumber
            },
            { new: true }
        );
        
        if (!order) return res.status(404).send();
        res.json(order);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Annuler une commande
router.post('/:id/cancel', auth, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id,
            status: 'pending'
        });

        if (!order) {
            return res.status(404).send({ error: 'Commande non trouvée ou ne peut pas être annulée' });
        }

        // Remettre les produits en stock
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            product.stock += item.quantity;
            await product.save();
        }

        order.status = 'cancelled';
        await order.save();
        res.json(order);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Obtenir toutes les commandes (admin seulement)
router.get('/', adminAuth, async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'firstName lastName email')
            .populate('items.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
