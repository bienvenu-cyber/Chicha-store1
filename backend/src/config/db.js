import { MongoClient } from 'mongodb';
import logger from './logger.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chicha_store';

export async function connectDB() {
  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    const db = client.db();
    logger.info('Connexion à MongoDB réussie');
    
    return db;
  } catch (error) {
    logger.error('Erreur de connexion à MongoDB:', error);
    process.exit(1);
  }
}
