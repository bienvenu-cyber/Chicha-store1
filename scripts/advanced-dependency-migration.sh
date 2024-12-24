#!/bin/bash

set -e

# Couleurs et formatage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date +'%Y-%m-%d %H:%M:%S')] $message${NC}"
}

# Vérification des prérequis
pre_migration_checks() {
    log $BLUE "🔍 Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log $RED "❌ Node.js non installé. Veuillez l'installer."
        exit 1
    fi

    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        log $RED "❌ npm non installé. Veuillez l'installer."
        exit 1
    fi

    # Version minimale de Node.js
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    if [ "$(printf '%s\n' "16.0.0" "$NODE_VERSION" | sort -V | head -n1)" != "16.0.0" ]; then
        log $YELLOW "⚠️ Version de Node.js recommandée : >= 16.0.0. Version actuelle : $NODE_VERSION"
    fi
}

# Nettoyage complet
deep_clean() {
    log $BLUE "🧹 Nettoyage complet des dépendances..."
    
    # Supprimer les répertoires et fichiers de dépendances
    rm -rf node_modules
    rm -rf package-lock.json
    rm -rf yarn.lock
    
    # Nettoyer le cache npm
    npm cache clean --force
}

# Migration des dépendances
migrate_dependencies() {
    local project_path=$1
    
    log $BLUE "🚀 Migration du projet : $project_path"
    
    cd "$project_path"
    
    # Configuration npm sécurisée
    npm config set strict-ssl true
    npm config set registry https://registry.npmjs.org/
    
    # Installation des dépendances avec des options de sécurité
    npm install \
        --no-audit \
        --no-fund \
        --legacy-peer-deps \
        --engine-strict \
        --ignore-scripts
    
    # Mise à jour des dépendances principales
    npm install \
        react@latest \
        react-dom@latest \
        react-router-dom@latest \
        @reduxjs/toolkit@latest \
        @chakra-ui/react@latest \
        @emotion/react@latest \
        @emotion/styled@latest \
        nth-check@latest \
        postcss@latest \
        webpack@latest \
        loader-utils@latest \
        --save \
        --legacy-peer-deps
    
    # Mise à jour des dépendances de développement
    npm install \
        react-scripts@latest \
        @babel/core@latest \
        typescript@latest \
        eslint@latest \
        --save-dev \
        --legacy-peer-deps
    
    # Audit de sécurité avec correction forcée
    npm audit fix --force
    
    cd -
}

# Projets à migrer
PROJECTS=(
    "/Users/bv/CascadeProjects/chicha-store/frontend"
    "/Users/bv/CascadeProjects/chicha-store/backend"
    "/Users/bv/CascadeProjects/chicha-store/admin"
)

# Processus principal de migration
main() {
    log $GREEN "🔄 Début de la migration avancée des dépendances"
    
    pre_migration_checks
    
    for project in "${PROJECTS[@]}"; do
        log $YELLOW "🛠️ Traitement du projet : $project"
        
        # Sauvegarde du package.json original
        cp "$project/package.json" "$project/package.json.backup"
        
        deep_clean
        migrate_dependencies "$project"
    done
    
    log $GREEN "✅ Migration des dépendances terminée avec succès !"
}

# Exécution du script
main
