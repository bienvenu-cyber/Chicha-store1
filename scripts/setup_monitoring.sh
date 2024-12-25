#!/bin/bash

# Aller dans le répertoire du script
cd /Users/bv/CascadeProjects/chicha-store/scripts

# Créer l'environnement virtuel
python3 -m venv monitoring_env

# Activer l'environnement virtuel
source monitoring_env/bin/activate

# Installer les dépendances
pip install -r requirements_monitoring.txt

# Rendre le script de monitoring exécutable
chmod +x advanced_monitoring.py

# Configuration du crontab pour l'exécution périodique
(crontab -l 2>/dev/null; echo "*/15 * * * * /Users/bv/CascadeProjects/chicha-store/scripts/monitoring_env/bin/python /Users/bv/CascadeProjects/chicha-store/scripts/advanced_monitoring.py") | crontab -

echo "🚀 Configuration du monitoring Chicha Store terminée !"
