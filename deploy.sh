#!/bin/bash

# Script de déploiement pour Chicha Store

# Arrêter le script en cas d'erreur
set -e

# Variables
BACKEND_DIR="./backend"
FRONTEND_DIR="./frontend"
PRODUCTION_ENV=".env.production"

# Vérifier les prérequis
command -v node >/dev/null 2>&1 || { echo >&2 "Node.js est requis mais n'est pas installé."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo >&2 "npm est requis mais n'est pas installé."; exit 1; }
command -v pm2 >/dev/null 2>&1 || { echo >&2 "pm2 est requis mais n'est pas installé. Installez-le avec 'npm install -g pm2'"; exit 1; }

# Étape 1: Mise à jour du code
echo "🔄 Mise à jour du dépôt..."
git pull origin main

# Étape 2: Installation des dépendances Backend
echo "📦 Installation des dépendances Backend..."
cd "$BACKEND_DIR"
npm ci --production
cp "$PRODUCTION_ENV" .env

# Étape 3: Build Backend
echo "🛠️ Build Backend..."
npm run build

# Étape 4: Installation des dépendances Frontend
echo "📦 Installation des dépendances Frontend..."
cd "../$FRONTEND_DIR"
npm ci --production
cp "$PRODUCTION_ENV" .env

# Étape 5: Build Frontend
echo "🛠️ Build Frontend..."
npm run build

# Étape 6: Démarrage du Backend avec PM2
echo "🚀 Démarrage du Backend..."
cd "../$BACKEND_DIR"
pm2 delete chicha-backend || true
pm2 start dist/server.js --name chicha-backend

# Étape 7: Déploiement Frontend (par exemple avec Nginx)
echo "🌐 Déploiement Frontend..."
sudo rm -rf /var/www/chicha-store/*
sudo cp -r build/* /var/www/chicha-store/

# Étape 8: Redémarrage des services
echo "🔄 Redémarrage des services..."
sudo systemctl restart nginx
pm2 save

echo "✅ Déploiement terminé avec succès !"

# Optionnel : Nettoyage
npm prune --production
