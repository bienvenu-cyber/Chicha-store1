import logger from '../utils/logger.js.js.js.js';
import mongoose from 'mongoose';

// Configuration de la connexion à la base de test
const connectTestDatabase = async () => {
  try {
    const testDbUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/chicha_store_test';
    
    // Ajout de configurations de connexion plus robustes
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout de 5 secondes
      retryWrites: true
    };

    await mongoose.connect(testDbUri, connectionOptions);
    logger.info('Connexion à la base de test réussie');
  } catch (error) {
    logger.error('Erreur de connexion à la base de test', { 
      error: error.message,
      stack: error.stack
    });
    throw new Error(`Impossible de se connecter à la base de test : ${error.message}`);
  }
};

// Nettoyage de la base de test
const teardownTestDatabase = async () => {
  try {
    // Suppression de toutes les collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    
    // Fermeture de la connexion
    await mongoose.connection.close();
    logger.info('Nettoyage et fermeture de la base de test réussis');
  } catch (error) {
    logger.error('Erreur lors du nettoyage de la base de test', { 
      error: error.message,
      stack: error.stack 
    });
    throw new Error(`Erreur lors du nettoyage de la base de test : ${error.message}`);
  }
};

export default {
  connectTestDatabase,
  teardownTestDatabase
};
