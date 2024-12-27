import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import logger from './src/config/logger.js';

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

// Gestion des erreurs
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Une erreur interne est survenue'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  logger.info(`Serveur démarré sur le port ${PORT}`);
});
