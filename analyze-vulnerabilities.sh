#!/bin/bash

# Fonction pour analyser les vulnérabilités Dependabot
analyze_vulnerabilities() {
    echo "🔍 Analyse des vulnérabilités Dependabot"
    
    # Backend
    echo "\n📦 Vulnérabilités Backend :"
    cd backend
    npm audit --json | jq '.vulnerabilities | to_entries[] | select(.value.severity == "high" or .value.severity == "critical")'
    
    # Frontend
    echo "\n📦 Vulnérabilités Frontend :"
    cd ../frontend
    npm audit --json | jq '.vulnerabilities | to_entries[] | select(.value.severity == "high" or .value.severity == "critical")'
}

# Exécuter l'analyse
analyze_vulnerabilities
