import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration des chemins pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../.env.development') });

async function diagnosticMongoDB() {
  console.log('🔍 Diagnostic de Connexion MongoDB');
  console.log('-----------------------------------');
  
  try {
    // Afficher les informations de connexion
    console.log(`📍 URI de Connexion : ${process.env.MONGODB_URI}`);
    
    // Mesurer le temps de connexion
    const startTime = Date.now();
    
    // Tenter de se connecter
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000
    });
    
    const connectionTime = Date.now() - startTime;
    
    console.log('✅ Connexion réussie !');
    console.log(`⏱️  Temps de connexion : ${connectionTime}ms`);
    
    // Vérifier la base de données
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📊 Informations sur la Base de Données :');
    console.log(`📁 Nombre de collections : ${collections.length}`);
    console.log('Collections :');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
  } catch (error) {
    console.error('❌ Échec de la connexion à MongoDB');
    console.error('Détails de l\'erreur :');
    console.error(error);
    
    // Diagnostics supplémentaires en cas d'erreur
    if (error.name === 'MongoNetworkError') {
      console.error('\n🔧 Vérifiez :');
      console.error('1. Le serveur MongoDB est-il démarré ?');
      console.error('2. L\'URI de connexion est-elle correcte ?');
      console.error('3. Avez-vous les bonnes autorisations ?');
    }
  } finally {
    // Fermer la connexion
    await mongoose.disconnect();
  }
}

// Exécuter le diagnostic
diagnosticMongoDB().catch(console.error);
