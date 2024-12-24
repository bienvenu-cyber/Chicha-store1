#!/bin/bash

# Vérifiez que GitHub CLI est installé
if ! command -v gh &> /dev/null
then
    echo "GitHub CLI (gh) n'est pas installé. Installez-le avec 'brew install gh'"
    exit 1
fi

# Fonction pour ajouter un secret
add_secret() {
    local secret_name=$1
    read -p "Entrez la valeur pour $secret_name : " secret_value
    gh secret set "$secret_name" -b "$secret_value"
}

# Liste des secrets à configurer
SECRETS=(
    "RENDER_DEPLOY_HOOK"
    "SLACK_WEBHOOK"
    "MONGODB_URI"
    "JWT_SECRET"
    "ENCRYPTION_KEY"
)

# Boucle pour ajouter chaque secret
for secret in "${SECRETS[@]}"
do
    add_secret "$secret"
done

echo "🔐 Configuration des secrets GitHub terminée !"
