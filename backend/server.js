import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import logger from './src/config/logger.js';

// Routes
import articleAnalyticsRoutes from './src/routes/articleAnalyticsRoutes.js';
import analyticsArchiveRoutes from './src/routes/analyticsArchiveRoutes.js';

// Services
import analyticsCleanupService from './src/services/analyticsCleanupService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de sécurité
app.use(helmet());
app.use(cors());
app.use(express.json());

// Connexion à la base de données
connectDB()
  .then(() => {
    logger.info('Base de données connectée avec succès');
    
    // Initialiser le service de nettoyage des analytics
    analyticsCleanupService.start();
  })
  .catch((error) => {
    logger.error('Échec de connexion à la base de données', error);
  });

// Route de santé
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Backend Chicha Store est opérationnel',
    timestamp: new Date().toISOString()
  });
});

// Routes d'analytics
app.use('/api/article-analytics', articleAnalyticsRoutes);
app.use('/api/analytics-archives', analyticsArchiveRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  logger.error('Erreur non gérée', err);
  res.status(500).json({
    status: 'error',
    message: 'Une erreur interne est survenue'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  logger.info(`Serveur démarré sur le port ${PORT}`);
});

export default app;
