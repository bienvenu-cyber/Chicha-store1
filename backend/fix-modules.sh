#!/bin/bash

cd /Users/bv/CascadeProjects/chicha-store/backend

# Mise à jour de la configuration des modules
cat > package.json << EOL
{
  "name": "chicha-store-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongodb": "^5.9.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
EOL

# Correction du fichier server.js pour les imports ES
cat > server.js << EOL
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connexion à la base de données
connectDB();

// Middleware
app.use(express.json());

// Routes de base
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(\`Serveur démarré sur le port \${PORT}\`);
});
EOL

# Réinstallation des dépendances
npm install
