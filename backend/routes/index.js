const express = require('express');
const router = express.Router();

// Importation des routes
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const imageUploadRoutes = require('./imageUploadRoutes');
const recommendationRoutes = require('./recommendationRoutes');
const personalizationRoutes = require('./personalizationRoutes');

// Routes d'authentification
router.use('/auth', authRoutes);

// Routes de produits
router.use('/products', productRoutes);

// Routes de téléchargement d'images
router.use('/uploads', imageUploadRoutes);

// Routes de recommandation
router.use('/recommendations', recommendationRoutes);

// Routes de personnalisation
router.use('/personalization', personalizationRoutes);

// Gestion des erreurs centralisée
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Une erreur serveur est survenue',
        error: process.env.NODE_ENV === 'production' ? {} : err.stack
    });
});

// Route de test
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

module.exports = router;
