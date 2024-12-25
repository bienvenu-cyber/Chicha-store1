import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration des chemins pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../.env.development') });

// Configuration des règles de validation
const requiredVariables = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'SENTRY_DSN'
];

const recommendedVariables = [
  'STRIPE_SECRET_KEY',
  'SENDGRID_API_KEY',
  'CORS_ORIGIN'
];

function validateEnvironment() {
  console.log('🔍 Validation des Variables d\'Environnement');
  console.log('-----------------------------------');

  // Vérification des variables requises
  console.log('\n🔒 Variables Requises :');
  let missingRequired = false;
  
  requiredVariables.forEach(variable => {
    if (!process.env[variable]) {
      console.error(`❌ Variable manquante : ${variable}`);
      missingRequired = true;
    } else {
      console.log(`✅ ${variable} : configurée`);
    }
  });

  if (missingRequired) {
    console.error('\n❗ Certaines variables requises sont manquantes !');
  }

  // Recommandations pour les variables optionnelles
  console.log('\n💡 Variables Recommandées :');
  recommendedVariables.forEach(variable => {
    if (!process.env[variable]) {
      console.warn(`⚠️  Variable recommandée non configurée : ${variable}`);
    } else {
      console.log(`✅ ${variable} : configurée`);
    }
  });

  // Vérification de la sécurité de certaines variables
  console.log('\n🛡️  Vérifications de Sécurité :');
  
  // Vérification de la complexité du JWT_SECRET
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET trop court. Recommandation : 32+ caractères');
  }

  // Vérification du mode de développement
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  Mode développement actif. Assurez-vous de ne pas utiliser ces configurations en production.');
  }
}

validateEnvironment();
