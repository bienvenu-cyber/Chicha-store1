#!/bin/bash

# Configuration du script pour être plus verbeux et gérer les erreurs
set -e  # Arrêter le script en cas d'erreur
set -x  # Afficher les commandes exécutées

# Aller dans le répertoire du script
cd /Users/bv/CascadeProjects/chicha-store/scripts

# Créer l'environnement virtuel s'il n'existe pas
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activer l'environnement virtuel
source venv/bin/activate

# Mettre à jour pip
pip install --upgrade pip

# Installer les dépendances
pip install python-dotenv

# Exécuter le script de test
python3 test-email-monitoring.py

# Afficher le contenu du log
cat /tmp/email_test.log

# Désactiver l'environnement virtuel
deactivate
