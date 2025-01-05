#!/bin/bash

# Script de génération de certificats SSL avec Let's Encrypt

# Vérifier que le script est exécuté avec des privilèges sudo
if [[ $EUID -ne 0 ]]; then
   echo "Ce script doit être exécuté avec sudo" 
   exit 1
fi

# Domaines
DOMAINS=("chicha-store.com" "www.chicha-store.com")

# Email pour l'enregistrement
EMAIL="votre-email@example.com"

# Installation de Certbot si nécessaire
if ! command -v certbot &> /dev/null; then
    echo "Installation de Certbot..."
    sudo snap install --classic certbot
    sudo ln -s /snap/bin/certbot /usr/bin/certbot
fi

# Génération des certificats
for domain in "${DOMAINS[@]}"; do
    certbot certonly \
        --standalone \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL" \
        -d "$domain"
done

# Configuration du renouvellement automatique
(crontab -l 2>/dev/null; echo "0 0,12 * * * python -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew --quiet") | crontab -

echo "Certificats SSL générés et configuration de renouvellement automatique terminée."
