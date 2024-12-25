import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeSentry } from './src/config/sentry.js.js.js';
import { logger, expressLogger } from './src/config/logger.js.js.js';

// Configuration des chemins pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../.env.development') });

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

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
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    logger.info('Connexion à MongoDB réussie');
    
    // Charger dynamiquement les routes
    for (const routeName of routeFiles) {
      try {
        const routePath = path.join(__dirname, 'routes', `${routeName}.js`);
        const { default: route } = await import(routePath);
        
        // Extraire le nom de la route à partir du nom du fichier
        const apiRouteName = routeName.replace('Routes', '');
        app.use(`/api/${apiRouteName}`, route);
        logger.info(`Route ${apiRouteName} chargée avec succès`);
      } catch (routeError) {
        logger.error(`Erreur de chargement de la route ${routeName}:`, routeError);
      }
    }
    
    // Ajout d'une route par défaut
    app.get('/', (req, res) => {
      res.json({
        message: 'Bienvenue sur l\'API Chicha Store',
        status: 'running',
        timestamp: new Date().toISOString()
      });
    });

    // Démarrage du serveur
    server.listen(PORT, () => {
      logger.info(`Serveur démarré sur le port ${PORT}`);
    });

  } catch (error) {
    logger.error('Échec de la connexion à MongoDB', error);
    process.exit(1);
  }
}

connectToDatabase();
