#!/bin/bash

# Configuration du projet backend
cd /Users/bv/CascadeProjects/chicha-store/backend

# Nettoyage complet
rm -rf node_modules
rm -rf dist
rm package-lock.json

# Création d'un nouveau package.json
cat > package.json << EOL
{
  "name": "chicha-store-backend",
  "version": "1.0.0",
  "type": "module",
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "start": "node --experimental-modules server.js",
    "dev": "nodemon --experimental-modules server.js",
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongodb": "^5.9.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.5",
    "nodemon": "^3.0.2",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1",
    "jest": "^29.7.0"
  },
  "optionalDependencies": {
    "fsevents": "*"
  },
  "nodemonConfig": {
    "ignore": ["node_modules/fsevents/*"]
  }
}
EOL

# Configuration ESLint
cat > .eslintrc.json << EOL
{
  "env": {
    "es2021": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"]
  }
}
EOL

# Configuration Prettier
cat > .prettierrc << EOL
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100
}
EOL

# Création du serveur principal
cat > server.js << EOL
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
  logger.info(\`Serveur démarré sur le port \${PORT}\`);
});
EOL

# Configuration de la base de données
mkdir -p src/config
cat > src/config/db.js << EOL
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
EOL

# Configuration du logger
cat > src/config/logger.js << EOL
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

export default logger;
EOL

# Création du dossier logs
mkdir -p logs

# Installation des dépendances
npm install --ignore-scripts

# Création d'un fichier .env
cat > .env << EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chicha_store
NODE_ENV=development
EOL

# Démarrage du serveur en mode développement
npm run dev
