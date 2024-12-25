import express from 'express';
const router = express.Router();
import Promotion from '../models/Promotion.js.js';
import Product from '../models/Product.js.js';
import { auth, adminAuth } from '../middleware/auth.js.js';

// Créer une nouvelle promotion (admin only)
router.post('/', adminAuth, async (req, res) => {
    try {
        const { 
            code, 
            description, 
            discountType, 
            discountValue, 
            startDate, 
            endDate, 
            applicableProducts, 
            applicableCategories,
            minPurchaseAmount,
            maxDiscountAmount
        } = req.body;

        // Vérifier que les produits existent si spécifiés
        if (applicableProducts) {
            const productCheck = await Product.find({ 
                '_id': { $in: applicableProducts } 
            });
            if (productCheck.length !== applicableProducts.length) {
                return res.status(400).send('Un ou plusieurs produits spécifiés n\'existent pas');
            }
        }

        const promotion = new Promotion({
            code,
            description,
            discountType,
            discountValue,
            startDate: startDate || Date.now(),
            endDate,
            applicableProducts,
            applicableCategories,
            minPurchaseAmount,
            maxDiscountAmount,
            isActive: true
        });

        await promotion.save();
        res.status(201).json(promotion);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Récupérer toutes les promotions actives
router.get('/', adminAuth, async (req, res) => {
    try {
        const promotions = await Promotion.find({ 
            isActive: true,
            endDate: { $gte: new Date() }
        }).populate('applicableProducts', 'name');
        res.json(promotions);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Vérifier et appliquer une promotion
router.post('/apply', auth, async (req, res) => {
    try {
        const { code, cartItems } = req.body;

        // Trouver la promotion
        const promotion = await Promotion.findOne({ 
            code: code.toUpperCase(), 
            isActive: true,
            endDate: { $gte: new Date() }
        });

        if (!promotion) {
            return res.status(404).send('Promotion invalide ou expirée');
        }

        // Calculer le total du panier
        const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

        // Vérifier le montant minimum d'achat
        if (cartTotal < promotion.minPurchaseAmount) {
            return res.status(400).send(`Montant minimum d'achat requis: ${promotion.minPurchaseAmount} €`);
        }

        // Filtrer les produits éligibles
        const eligibleItems = cartItems.filter(item => {
            // Vérifier si le produit est dans la liste des produits applicables
            const productEligible = !promotion.applicableProducts || 
                promotion.applicableProducts.includes(item.productId);
            
            // Vérifier si la catégorie est éligible
            const categoryEligible = !promotion.applicableCategories || 
                promotion.applicableCategories.includes(item.category);

            return productEligible && categoryEligible;
        });

        // Calculer la réduction
        let discount = 0;
        if (promotion.discountType === 'percentage') {
            discount = cartTotal * (promotion.discountValue / 100);
        } else {
            discount = promotion.discountValue;
        }

        // Appliquer le plafond de réduction si défini
        if (promotion.maxDiscountAmount && discount > promotion.maxDiscountAmount) {
            discount = promotion.maxDiscountAmount;
        }

        res.json({
            promotionCode: promotion.code,
            originalTotal: cartTotal,
            discount: discount,
            finalTotal: cartTotal - discount
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Mettre à jour une promotion
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const promotion = await Promotion.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );

        if (!promotion) {
            return res.status(404).send('Promotion non trouvée');
        }

        res.json(promotion);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Désactiver une promotion
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const promotion = await Promotion.findByIdAndUpdate(
            req.params.id, 
            { isActive: false }, 
            { new: true }
        );

        if (!promotion) {
            return res.status(404).send('Promotion non trouvée');
        }

        res.json(promotion);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default router;
