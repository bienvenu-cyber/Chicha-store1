const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const path = require('path');
const config = require('./config/config');

// Services
const logger = require('./services/logger');
const WebSocketService = require('./services/websocketService');
const recommendationService = require('./services/recommendationService');
const InnovationIntegrationService = require('./services/innovationIntegrationService');
const AugmentedRealityService = require('./frontend/src/services/augmentedRealityService');
const AIRecommendationEngine = require('./services/aiRecommendationEngine');
const BehavioralAIService = require('./services/behavioralAIService');
const CommunityEngagementService = require('./services/communityEngagementService');
const MixCreationGameService = require('./services/mixCreationGameService');

// Routes
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const mobilePaymentRoutes = require('./routes/mobilePayments');
const cryptoPaymentRoutes = require('./routes/cryptoPayments');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', { 
      ip: req.ip, 
      path: req.path 
    });
    res.status(429).send({ 
      error: 'Trop de requêtes. Veuillez réessayer plus tard.' 
    });
  }
});

// Middleware
app.use(helmet()); // Secure HTTP headers
app.use(globalLimiter); // Apply rate limiting
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({
  limit: '10kb', // Limit payload size
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      logger.warn('Invalid JSON payload', { 
        ip: req.ip, 
        error: e.message 
      });
      throw new Error('Invalid JSON');
    }
  }
}));

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.logRequest(req);
    
    if (res.statusCode >= 400) {
      logger.warn(`Error Response: ${res.statusCode}`, { 
        method: req.method, 
        path: req.path, 
        ip: req.ip 
      });
    }
  });
  
  next();
});

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => logger.info('Connecté à MongoDB'))
.catch(err => logger.error('Erreur de connexion MongoDB', { error: err.message }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/mobile-payments', mobilePaymentRoutes);
app.use('/api/crypto-payments', cryptoPaymentRoutes);
app.use('/api/auth', authRoutes);

// Routes de recommandation
app.post('/api/recommendations/personalized', async (req, res) => {
  try {
    const { userId, context } = req.body;
    const recommendations = await recommendationService.getPersonalizedRecommendations(
      userId, 
      context
    );
    res.json(recommendations);
  } catch (error) {
    logger.error('Recommendation route error', { error: error.message });
    res.status(500).json({ error: 'Erreur de recommandation' });
  }
});

app.get('/api/recommendations/related/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const relatedProducts = await recommendationService.getRelatedProducts(productId);
    res.json(relatedProducts);
  } catch (error) {
    logger.error('Related products route error', { error: error.message });
    res.status(500).json({ error: 'Erreur de produits similaires' });
  }
});

app.post('/api/recommendations/browsing', async (req, res) => {
  try {
    const { lastViewedProducts } = req.body;
    const recommendations = await recommendationService.getBrowsingRecommendations(
      lastViewedProducts
    );
    res.json(recommendations);
  } catch (error) {
    logger.error('Browsing recommendations route error', { error: error.message });
    res.status(500).json({ error: 'Erreur de recommandations de navigation' });
  }
});

// Nouvelles routes d'innovation
app.get('/api/innovations/initialize', async (req, res) => {
  try {
    const user = req.user; // À remplacer par l'authentification réelle
    const userExperience = await InnovationIntegrationService.initializeUserExperience(user);
    res.json(userExperience);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de l\'initialisation de l\'expérience utilisateur', 
      error: error.message 
    });
  }
});

app.post('/api/mix/create', async (req, res) => {
  try {
    const user = req.user; // À remplacer par l'authentification réelle
    const mixData = req.body;
    const augmentedMixCreation = await InnovationIntegrationService.augmentMixCreation(user, mixData);
    res.json(augmentedMixCreation);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la création du mélange', 
      error: error.message 
    });
  }
});

app.get('/api/user/report', async (req, res) => {
  try {
    const user = req.user; // À remplacer par l'authentification réelle
    const comprehensiveReport = await InnovationIntegrationService.generateComprehensiveUserReport(user);
    res.json(comprehensiveReport);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la génération du rapport utilisateur', 
      error: error.message 
    });
  }
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  logger.error('Unhandled Error', { 
    error: err.message, 
    stack: err.stack,
    ip: req.ip 
  });
  
  res.status(500).json({
    error: 'Une erreur interne est survenue',
    message: process.env.NODE_ENV === 'production' 
      ? 'Erreur serveur' 
      : err.message
  });
});

// Gestion des erreurs 404 pour les routes API
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ 
      error: 'Route API non trouvée', 
      path: req.originalUrl 
    });
  }
  next();
});

// Servir les fichiers statiques du frontend APRÈS les routes API
app.use('/api/static', express.static(path.join(__dirname, '../frontend/build/static')));
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Route pour le frontend - doit être la dernière route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Initialisation WebSocket
const websocketService = new WebSocketService(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Serveur démarré sur le port ${PORT}`);
  
  // Initialisation des services d'innovation
  if (config.innovations.augmentedReality.enabled) {
    console.log('🕶️  Service de Réalité Augmentée initialisé');
  }
  
  if (config.innovations.aiRecommendation.enabled) {
    AIRecommendationEngine.initializeDeepLearningModel();
    console.log('🧠 Moteur de Recommandation IA initialisé');
  }
});

module.exports = app;
