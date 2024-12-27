#!/bin/bash

# Couleurs
GREEN='\033[0;32m'
NC='\033[0m'

# Démarrer le démon Docker
echo -e "${GREEN}🚀 Démarrage de Docker...${NC}"
open -a Docker.app

# Attendre que Docker soit prêt
echo -e "${GREEN}⏳ Attente du démarrage de Docker...${NC}"
sleep 15

# Vérification des prérequis
check_prerequisites() {
    echo -e "${GREEN}🔍 Vérification des prérequis...${NC}"
    
    REQUIRED_TOOLS=("git" "npm" "docker" "docker-compose")
    
    for tool in "${REQUIRED_TOOLS[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            echo -e "\033[31m❌ Outil manquant : $tool\033[0m"
            exit 1
        fi
    done
}

# Préparation du déploiement
prepare_deployment() {
    echo -e "${GREEN}🛠️  Préparation du déploiement...${NC}"
    
    # Installation des dépendances frontend
    cd frontend
    npm install
    npm run build
    cd ..
}

# Déploiement avec Docker Compose
deploy_with_docker_compose() {
    echo -e "${GREEN}🚀 Déploiement avec Docker Compose...${NC}"
    
    # Arrêter et supprimer les conteneurs existants
    docker-compose down
    
    # Construire les images
    docker-compose build
    
    # Démarrer les services
    docker-compose up -d
    
    # Afficher les logs
    docker-compose logs -f
}

# Fonction principale
main() {
    echo -e "${GREEN}🌟 Déploiement de Chicha Store 🌟${NC}"
    
    check_prerequisites
    prepare_deployment
    deploy_with_docker_compose
    
    echo -e "${GREEN}✅ Déploiement terminé avec succès !${NC}"
}

# Exécution
main
