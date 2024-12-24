#!/bin/bash

# Couleurs pour le terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier que GitHub CLI est installé
if ! command -v gh &> /dev/null
then
    echo -e "${RED}Erreur : GitHub CLI (gh) n'est pas installé.${NC}"
    echo "Installez-le avec : brew install gh"
    exit 1
fi

# Vérifier l'authentification GitHub
if ! gh auth status &> /dev/null
then
    echo -e "${YELLOW}Vous devez vous connecter à GitHub CLI.${NC}"
    gh auth login
fi

# Fonction pour ajouter un secret
add_secret() {
    local secret_name=$1
    local prompt_message=$2

    echo -e "${YELLOW}Configuration du secret : $secret_name${NC}"
    read -p "$prompt_message : " secret_value

    if [ -z "$secret_value" ]; then
        echo -e "${RED}Erreur : La valeur du secret ne peut pas être vide.${NC}"
        return 1
    fi

    gh secret set "$secret_name" -b "$secret_value"
    echo -e "${GREEN}Secret $secret_name configuré avec succès !${NC}"
}

# Liste des secrets à configurer
secrets=(
    "RENDER_DEPLOY_HOOK:URL du webhook de déploiement Render"
    "SLACK_WEBHOOK:URL du webhook Slack pour les notifications"
    "MONGODB_URI:URL de connexion MongoDB"
    "SENTRY_DSN:DSN du projet Sentry"
    "JWT_SECRET:Clé secrète pour JWT"
    "ENCRYPTION_KEY:Clé de chiffrement"
)

# Boucle pour configurer chaque secret
for secret in "${secrets[@]}"
do
    IFS=':' read -r name prompt <<< "$secret"
    add_secret "$name" "$prompt"
done

echo -e "${GREEN}🎉 Configuration des secrets GitHub terminée !${NC}"
