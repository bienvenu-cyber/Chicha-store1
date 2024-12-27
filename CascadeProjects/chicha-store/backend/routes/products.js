const express = import('express');
const router = express.Router();
const Product = import('../models/Product');
const { auth, adminAuth } = import('../middleware/auth');

// Obtenir tous les produits avec filtres
router.get('/', async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, sort } = req.query;
        let query = {};

        // Filtres
        if (category) query.category = category;
        if (search) query.$text = { $search: search };
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Tri
        let sortOption = {};
        if (sort === 'price-asc') sortOption.price = 1;
        if (sort === 'price-desc') sortOption.price = -1;
        if (sort === 'newest') sortOption.createdAt = -1;

        const products = await Product.find(query).sort(sortOption);
        res.json(products);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Obtenir un produit par ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send();
        res.json(product);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Créer un nouveau produit (admin seulement)
router.post('/', adminAuth, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Mettre à jour un produit (admin seulement)
router.patch('/:id', adminAuth, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) return res.status(404).send();
        res.json(product);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Supprimer un produit (admin seulement)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).send();
        res.send(product);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Ajouter une évaluation
router.post('/:id/ratings', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send();

        product.ratings.push({
            user: req.user._id,
            rating: req.body.rating,
            comment: req.body.comment
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Ajouter un avis à un produit
router.post('/:id/reviews', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send('Produit non trouvé');

        const { rating, comment } = req.body;

        // Vérifier que l'utilisateur n'a pas déjà laissé un avis
        const existingReview = product.ratings.find(r => r.user.toString() === req.user._id.toString());
        if (existingReview) {
            return res.status(400).send('Vous avez déjà laissé un avis pour ce produit');
        }

        // Ajouter le nouvel avis
        product.ratings.push({
            user: req.user._id,
            rating: rating,
            comment: comment
        });

        // Calculer la note moyenne
        const totalRatings = product.ratings.reduce((sum, r) => sum + r.rating, 0);
        product.averageRating = totalRatings / product.ratings.length;

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Récupérer les avis d'un produit
router.get('/:id/reviews', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('ratings.user', 'name');
        if (!product) return res.status(404).send('Produit non trouvé');

        res.json(product.ratings);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Mettre à jour un avis
router.put('/:id/reviews/:reviewId', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send('Produit non trouvé');

        const review = product.ratings.id(req.params.reviewId);
        if (!review) return res.status(404).send('Avis non trouvé');

        // Vérifier que l'utilisateur est bien l'auteur de l'avis
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).send('Non autorisé à modifier cet avis');
        }

        // Mettre à jour l'avis
        review.rating = req.body.rating || review.rating;
        review.comment = req.body.comment || review.comment;

        // Recalculer la note moyenne
        const totalRatings = product.ratings.reduce((sum, r) => sum + r.rating, 0);
        product.averageRating = totalRatings / product.ratings.length;

        await product.save();
        res.json(product);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Supprimer un avis
router.delete('/:id/reviews/:reviewId', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send('Produit non trouvé');

        const reviewIndex = product.ratings.findIndex(r => r._id.toString() === req.params.reviewId);
        if (reviewIndex === -1) return res.status(404).send('Avis non trouvé');

        // Vérifier que l'utilisateur est bien l'auteur de l'avis
        if (product.ratings[reviewIndex].user.toString() !== req.user._id.toString()) {
            return res.status(403).send('Non autorisé à supprimer cet avis');
        }

        // Supprimer l'avis
        product.ratings.splice(reviewIndex, 1);

        // Recalculer la note moyenne
        const totalRatings = product.ratings.reduce((sum, r) => sum + r.rating, 0);
        product.averageRating = product.ratings.length > 0 ? totalRatings / product.ratings.length : 0;

        await product.save();
        res.json(product);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default = router;
