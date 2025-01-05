#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AnalyticsArchive from '../src/models/AnalyticsArchive.js';
import { ArticleEvent } from '../src/models/ArticleAnalytics.js';
import logger from '../src/config/logger.js';

// Charger les variables d'environnement
dotenv.config();

// Configuration de la connexion MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info('Connexion à MongoDB réussie');
  } catch (error) {
    logger.error('Échec de connexion à MongoDB', error);
    process.exit(1);
  }
};

// Fonction de migration historique
const migrateHistoricalData = async () => {
  try {
    // Récupérer la date du premier événement
    const oldestEvent = await ArticleEvent.findOne({}).sort({ timestamp: 1 });
    
    if (!oldestEvent) {
      logger.info('Aucun événement trouvé à migrer');
      return;
    }

    const startDate = oldestEvent.timestamp;
    const now = new Date();

    // Périodes d'archivage
    const periods = [
      { type: 'monthly', start: startDate, end: now }
    ];

    // Créer des archives pour chaque période
    for (const period of periods) {
      logger.info(`Migration des données de ${period.type}`, {
        startDate: period.start,
        endDate: period.end
      });

      await AnalyticsArchive.createArchive(
        period.type, 
        period.start, 
        period.end
      );
    }

    logger.info('Migration historique terminée');
  } catch (error) {
    logger.error('Erreur lors de la migration historique', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Fonction principale
const main = async () => {
  await connectDB();
  await migrateHistoricalData();
};

// Exécuter le script
main().catch(error => {
  logger.error('Erreur fatale', error);
  process.exit(1);
});
