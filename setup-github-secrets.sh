#!/bin/bash

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Fonction pour générer un secret sécurisé
generate_secret() {
    openssl rand -base64 32
}

# Vérifier GitHub CLI
if ! command -v gh &> /dev/null; then
    echo -e "${RED}GitHub CLI (gh) n'est pas installé.${NC}"
    echo "Installez-le avec : brew install gh"
    exit 1
fi

# Vérifier l'authentification
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}Connexion à GitHub nécessaire.${NC}"
    gh auth login
fi

# Demander le nom du dépôt
read -p "Entrez le nom du dépôt (format: utilisateur/depot): " REPO

# Secrets à configurer
SECRETS=(
    "RENDER_DEPLOY_HOOK:URL du webhook de déploiement Render"
    "MONGODB_URI:URL de connexion MongoDB"
    "SENTRY_DSN:DSN du projet Sentry"
    "JWT_SECRET:Clé secrète JWT"
    "ENCRYPTION_KEY:Clé de chiffrement"
)

# Configuration des secrets
for secret in "${SECRETS[@]}"
do
    IFS=':' read -r name prompt <<< "$secret"
    
    echo -e "${YELLOW}Configuration du secret : $name${NC}"
    echo -e "${YELLOW}$prompt${NC}"
    
    # Option de génération automatique pour certains secrets
    if [[ "$name" == "JWT_SECRET" || "$name" == "ENCRYPTION_KEY" ]]; then
        read -p "Voulez-vous générer un secret automatiquement ? (O/n) " generate_auto
        if [[ "$generate_auto" =~ ^[Oo]?$ ]]; then
            secret_value=$(generate_secret)
            echo -e "${GREEN}Secret généré automatiquement.${NC}"
        else
            read -p "Entrez manuellement le secret : " secret_value
        fi
    else
        read -p "Entrez la valeur : " secret_value
    fi

    # Ajouter le secret
    gh secret set "$name" -b "$secret_value" -R "$REPO"
    echo -e "${GREEN}Secret $name configuré avec succès !${NC}"
done

echo -e "${GREEN}🎉 Configuration des secrets GitHub terminée !${NC}"
