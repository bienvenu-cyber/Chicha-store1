const express = require('express');
const router = express.Router();
const articleAnalyticsController = require('../controllers/articleAnalyticsController');
const authMiddleware = require('../middleware/authMiddleware');

// Route pour tracker un événement
router.post('/track', 
  authMiddleware.authenticate,
  articleAnalyticsController.trackEvent
);

// Route pour récupérer les analytics d'un article
router.get('/:articleId', 
  authMiddleware.authenticate,
  authMiddleware.requireAdmin,
  articleAnalyticsController.getArticleAnalytics
);

// Route pour récupérer les articles les plus populaires
router.get('/top-articles', 
  authMiddleware.authenticate,
  authMiddleware.requireAdmin,
  articleAnalyticsController.getTopArticles
);

module.exports = router;
