import express from 'express';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Obtenir tous les produits avec filtres
router.get('/', async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, sort } = req.query;
        const database = global.database;
        const productsCollection = database.collection('products');
        
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

        const products = await productsCollection
            .find(query)
            .sort(sortOption)
            .toArray();
        
        res.json(products);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Obtenir un produit par ID
router.get('/:id', async (req, res) => {
    try {
        const database = global.database;
        const productsCollection = database.collection('products');
        
        const product = await productsCollection.findOne({ 
            _id: new ObjectId(req.params.id) 
        });
        
        if (!product) return res.status(404).send('Produit non trouvé');
        
        res.json(product);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Créer un nouveau produit (admin seulement)
router.post('/', async (req, res) => {
    try {
        const database = global.database;
        const productsCollection = database.collection('products');
        
        const product = await productsCollection.insertOne(req.body);
        res.status(201).json(product.ops[0]);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Mettre à jour un produit (admin seulement)
router.patch('/:id', async (req, res) => {
    try {
        const database = global.database;
        const productsCollection = database.collection('products');
        
        const product = await productsCollection.findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body },
            { returnOriginal: false }
        );
        
        if (!product.value) return res.status(404).send('Produit non trouvé');
        
        res.json(product.value);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Supprimer un produit (admin seulement)
router.delete('/:id', async (req, res) => {
    try {
        const database = global.database;
        const productsCollection = database.collection('products');
        
        const product = await productsCollection.findOneAndDelete({ 
            _id: new ObjectId(req.params.id) 
        });
        
        if (!product.value) return res.status(404).send('Produit non trouvé');
        
        res.send(product.value);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Ajouter une évaluation
router.post('/:id/ratings', async (req, res) => {
    try {
        const database = global.database;
        const productsCollection = database.collection('products');
        
        const product = await productsCollection.findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $push: { ratings: req.body } },
            { returnOriginal: false }
        );
        
        if (!product.value) return res.status(404).send('Produit non trouvé');
        
        res.status(201).json(product.value);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Ajouter un avis à un produit
router.post('/:id/reviews', async (req, res) => {
    try {
        const database = global.database;
        const productsCollection = database.collection('products');
        
        const product = await productsCollection.findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $push: { ratings: req.body } },
            { returnOriginal: false }
        );
        
        if (!product.value) return res.status(404).send('Produit non trouvé');
        
        // Calculer la note moyenne
        const totalRatings = product.value.ratings.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalRatings / product.value.ratings.length;
        
        await productsCollection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { averageRating } }
        );
        
        res.status(201).json(product.value);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Récupérer les avis d'un produit
router.get('/:id/reviews', async (req, res) => {
    try {
        const database = global.database;
        const productsCollection = database.collection('products');
        
        const product = await productsCollection.findOne({ 
            _id: new ObjectId(req.params.id) 
        });
        
        if (!product) return res.status(404).send('Produit non trouvé');
        
        res.json(product.ratings);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Mettre à jour un avis
router.put('/:id/reviews/:reviewId', async (req, res) => {
    try {
        const database = global.database;
        const productsCollection = database.collection('products');
        
        const product = await productsCollection.findOneAndUpdate(
            { 
                _id: new ObjectId(req.params.id), 
                'ratings._id': new ObjectId(req.params.reviewId) 
            },
            { $set: { 'ratings.$': req.body } },
            { returnOriginal: false }
        );
        
        if (!product.value) return res.status(404).send('Produit non trouvé');
        
        // Recalculer la note moyenne
        const totalRatings = product.value.ratings.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalRatings / product.value.ratings.length;
        
        await productsCollection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { averageRating } }
        );
        
        res.json(product.value);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Supprimer un avis
router.delete('/:id/reviews/:reviewId', async (req, res) => {
    try {
        const database = global.database;
        const productsCollection = database.collection('products');
        
        const product = await productsCollection.findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $pull: { ratings: { _id: new ObjectId(req.params.reviewId) } } },
            { returnOriginal: false }
        );
        
        if (!product.value) return res.status(404).send('Produit non trouvé');
        
        // Recalculer la note moyenne
        const totalRatings = product.value.ratings.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = product.value.ratings.length > 0 ? totalRatings / product.value.ratings.length : 0;
        
        await productsCollection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { averageRating } }
        );
        
        res.json(product.value);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default router;
