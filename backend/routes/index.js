import express from 'express';
const router = express.Router();

// Importation des routes
import authRoutes from './authRout.jses.js.js.js';
import productRoutes from './productRout.jses.js.js.js';
import imageUploadRoutes from './imageUploadRout.jses.js.js.js';
import recommendationRoutes from './recommendationRout.jses.js.js.js';
import personalizationRoutes from './personalizationRout.jses.js.js.js';

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

export default router;
