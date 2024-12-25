#!/bin/bash

# Création des répertoires de logs
sudo mkdir -p /var/log/chicha-store
sudo chown $USER:$USER /var/log/chicha-store

# Installation des dépendances Python
python3 -m venv monitoring-env
source monitoring-env/bin/activate
pip install -r requirements.txt

# Configuration des permissions du script
chmod +x email-monitoring.py

# Configuration du crontab
(crontab -l 2>/dev/null; echo "*/15 * * * * /path/to/chicha-store/scripts/monitoring-env/bin/python /path/to/chicha-store/scripts/email-monitoring.py") | crontab -
