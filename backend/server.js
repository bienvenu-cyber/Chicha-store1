import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeSentry, sentryErrorHandler } from './src/config/sentry.js';
import { logger, expressLogger } from './src/config/logger.js';

// Configuration des chemins pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialiser Sentry
const Sentry = initializeSentry(app);

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(expressLogger);

// Importer les routes dynamiquement
const routeFiles = [
  'authRoutes',
  'products',
  'users',
  'orders',
  'payments',
  'mobilePayments',
  'cryptoPayments'
];

// Connexion à MongoDB
async function connectToDatabase() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    await client.connect();
    console.log('Connecté à MongoDB');
    
    // Stocker la connexion globalement
    global.database = client.db(process.env.DB_NAME);
    
    // Charger dynamiquement les routes
    for (const routeName of routeFiles) {
      try {
        const routePath = path.join(__dirname, 'routes', `${routeName}.js`);
        const { default: route } = await import(routePath);
        
        // Extraire le nom de la route à partir du nom du fichier
        const apiRouteName = routeName.replace('Routes', '');
        app.use(`/api/${apiRouteName}`, route);
      } catch (routeError) {
        console.error(`Erreur de chargement de la route ${routeName}:`, routeError);
      }
    }
    
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
        res.status(500).json({ error: 'Erreur de recommandation' });
      }
    });

    app.get('/api/recommendations/related/:productId', async (req, res) => {
      try {
        const { productId } = req.params;
        const relatedProducts = await recommendationService.getRelatedProducts(productId);
        res.json(relatedProducts);
      } catch (error) {
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
        res.status(500).json({ error: 'Erreur de recommandations de navigation' });
      }
    });

    // Route par défaut
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../frontend/index.html'));
    });
    
    // Initialisation WebSocket
    const websocketService = new WebSocketService(server);

    // Gestionnaire d'erreurs Sentry
    sentryErrorHandler(app);

    // Gestionnaire d'erreurs global
    app.use((err, req, res, next) => {
      // Log de l'erreur
      logger.error('Unhandled Error', {
        message: err.message,
        stack: err.stack
      });

      // Capture de l'erreur dans Sentry
      Sentry.captureException(err);

      res.status(500).json({
        error: 'Une erreur interne est survenue',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    // Démarrer le serveur
    server.listen(PORT, () => {
      logger.info(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    });
  } catch (error) {
    logger.error('Échec du démarrage du serveur', { error });
    process.exit(1);
  }
}

connectToDatabase();
