#!/bin/bash

# Script de démarrage complet pour Chicha Store

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction de gestion des erreurs
handle_error() {
    echo -e "${YELLOW}Erreur lors de l'étape : $1${NC}"
    exit 1
}

# Vérification des dépendances
check_dependencies() {
    echo -e "${GREEN}🔍 Vérification des dépendances...${NC}"
    
    # Liste des dépendances requises
    dependencies=("node" "npm" "mongod")
    
    for dep in "${dependencies[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            echo -e "${YELLOW}❌ Dépendance manquante : $dep${NC}"
            exit 1
        fi
    done
}

# Installation des dépendances
install_dependencies() {
    echo -e "${GREEN}📦 Installation des dépendances...${NC}"
    npm run install:all || handle_error "Installation des dépendances"
}

# Génération des images de démonstration
generate_demo_images() {
    echo -e "${GREEN}🖼️  Génération des images de démonstration...${NC}"
    node backend/scripts/generateDemoImages.js || handle_error "Génération des images"
}

# Peuplement de la base de données
seed_database() {
    echo -e "${GREEN}💾 Peuplement de la base de données...${NC}"
    node backend/scripts/seedProducts.js || handle_error "Peuplement de la base de données"
}

# Démarrage du serveur de développement
start_development() {
    echo -e "${GREEN}🚀 Démarrage du serveur de développement...${NC}"
    npm run dev
}

# Fonction principale
main() {
    clear
    echo -e "${GREEN}🌟 Démarrage de Chicha Store 🌟${NC}"
    
    check_dependencies
    install_dependencies
    generate_demo_images
    seed_database
    start_development
}

# Exécution du script
main
