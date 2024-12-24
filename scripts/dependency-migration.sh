#!/bin/bash

set -e

# Couleurs pour les logs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Projets à migrer
PROJECTS=("frontend" "backend" "admin")

# Migration pour chaque projet
for project in "${PROJECTS[@]}"; do
    log_info "Migration du projet : $project"
    
    cd "/Users/bv/CascadeProjects/chicha-store/$project"
    
    # Sauvegarder l'ancien package.json
    cp package.json package.json.backup
    
    log_info "Mise à jour des dépendances principales"
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
        --save --legacy-peer-deps
    
    log_info "Mise à jour des dépendances de développement"
    npm install \
        react-scripts@latest \
        webpack@latest \
        @babel/core@latest \
        --save-dev --legacy-peer-deps
    
    log_warning "Vérifiez manuellement les changements dans package.json"
    
    # Audit de sécurité
    log_info "Audit de sécurité"
    npm audit fix --force
    
    cd -
done

log_info "Migration des dépendances terminée. Effectuez des tests approfondis !"
