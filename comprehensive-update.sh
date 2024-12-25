#!/bin/bash

# Fonction de mise à jour complète
comprehensive_update() {
    local project_path=$1
    echo "🔄 Mise à jour complète de $project_path"
    
    cd "$project_path"
    
    # Désactiver les avertissements de peer dependencies
    npm config set legacy-peer-deps true
    
    # Nettoyer complètement
    rm -rf node_modules package-lock.json
    
    # Mettre à jour npm
    npm install -g npm@latest
    
    # Réinstaller les dépendances
    npm install
    
    # Mettre à jour tous les packages
    npm update --save
    
    # Corriger les vulnérabilités
    npm audit fix --force
    
    # Vérifier et mettre à jour les packages critiques
    npm install \
        nth-check@latest \
        postcss@latest \
        webpack@latest \
        react-scripts@latest \
        loader-utils@latest \
        serialize-javascript@latest \
        shell-quote@latest
    
    # Audit final
    npm audit
    
    cd -
}

# Projets à mettre à jour
projects=(
    "/Users/bv/CascadeProjects/chicha-store/frontend"
    "/Users/bv/CascadeProjects/chicha-store/admin"
)

# Mise à jour de chaque projet
for project in "${projects[@]}"; do
    comprehensive_update "$project"
done

echo "✅ Mise à jour complète terminée"
