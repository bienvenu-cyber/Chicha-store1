#!/bin/bash

# Charger les variables d'environnement
source .env.monitoring

# Test du script de monitoring
echo "🔍 Test du système de monitoring Chicha Store"

# Vérification des dépendances
echo "📋 Vérification des prérequis..."
command -v python3 >/dev/null 2>&1 || { echo >&2 "Python3 requis mais non installé. Abandon."; exit 1; }
command -v pip >/dev/null 2>&1 || { echo >&2 "pip requis mais non installé. Abandon."; exit 1; }

# Installation des dépendances
echo "🔧 Installation des dépendances..."
python3 -m venv monitoring-env
source monitoring-env/bin/activate
pip install -r requirements.txt

# Test du script de monitoring
echo "📧 Test d'envoi d'email de monitoring..."
python3 email-monitoring.py

# Vérification du statut
if [ $? -eq 0 ]; then
    echo "✅ Test de monitoring réussi !"
else
    echo "❌ Échec du test de monitoring"
    exit 1
fi

# Désactivation de l'environnement virtuel
deactivate
