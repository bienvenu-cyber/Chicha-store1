#!/bin/bash

# Configuration du projet
PROJECT_DIR="/Users/bv/CascadeProjects/chicha-store/frontend"
cd $PROJECT_DIR

# Nettoyage complet
rm -rf node_modules
rm -rf dist
rm -rf build
rm package-lock.json

# Création d'un nouveau package.json
cat > package.json << EOL
{
  "name": "chicha-store-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "@mui/icons-material": "^6.3.0",
    "@mui/material": "^6.3.0",
    "@reduxjs/toolkit": "^2.5.0",
    "axios": "^1.7.9",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-redux": "^9.2.0",
    "react-router-dom": "^7.1.1",
    "redux": "^5.0.1",
    "web-vitals": "^4.2.4"
  },
  "devDependencies": {
    "@babel/core": "^7.26.0",
    "@babel/preset-env": "^7.26.0",
    "@babel/preset-react": "^7.24.1",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "react-scripts": "^5.0.1"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOL

# Configuration Babel
cat > babel.config.js << EOL
module.exports = {
  presets: [
    '@babel/preset-env',
    ['@babel/preset-react', { runtime: 'automatic' }]
  ]
}
EOL

# Configuration Jest
cat > jest.config.js << EOL
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  }
}
EOL

# Installation des dépendances
npm install

# Correction des problèmes de module
npm install --save-dev @babel/plugin-transform-runtime

# Mise à jour de la configuration Babel
cat > babel.config.js << EOL
module.exports = {
  presets: [
    '@babel/preset-env',
    ['@babel/preset-react', { runtime: 'automatic' }]
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ]
}
EOL

# Lancement des tests
npm test -- --maxWorkers=2

# Build de production
npm run build
