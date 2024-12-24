#!/bin/bash

# Script de déploiement automatique pour Chicha Store

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Vérification des prérequis
check_prerequisites() {
    echo -e "${GREEN}🔍 Vérification des prérequis...${NC}"
    
    # Liste des outils nécessaires
    REQUIRED_TOOLS=("git" "npm" "render-cli")
    
    for tool in "${REQUIRED_TOOLS[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            echo -e "${RED}❌ Outil manquant : $tool${NC}"
            exit 1
        fi
    done
}

# Préparation du déploiement
prepare_deployment() {
    echo -e "${GREEN}🛠️  Préparation du déploiement...${NC}"
    
    # Mise à jour des dépendances
    npm run install:all
    
    # Construction du projet
    npm run build
}

# Déploiement sur Render
deploy_to_render() {
    echo -e "${GREEN}🚀 Déploiement sur Render...${NC}"
    
    # Connexion à Render
    render login
    
    # Déploiement du frontend
    render deploy frontend
    
    # Déploiement du backend
    render deploy backend
}

# Configuration de la base de données
configure_database() {
    echo -e "${GREEN}💾 Configuration de la base de données...${NC}"
    
    # Création d'une base de données Render
    render database create chicha-store-db
}

# Fonction principale
main() {
    clear
    echo -e "${GREEN}🌟 Déploiement de Chicha Store 🌟${NC}"
    
    check_prerequisites
    prepare_deployment
    configure_database
    deploy_to_render
    
    echo -e "${GREEN}✅ Déploiement terminé avec succès !${NC}"
}

# Exécution du script
main
