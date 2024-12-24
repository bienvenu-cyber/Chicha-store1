#!/bin/bash

# Fonction de résolution des dépendances
resolve_dependencies() {
    local project_path=$1
    echo "🔧 Résolution des dépendances pour $project_path"
    
    cd "$project_path"
    
    # Nettoyer le cache npm
    npm cache clean --force
    
    # Supprimer les node_modules et package-lock.json
    rm -rf node_modules package-lock.json
    
    # Installer les dépendances avec des options de résolution de conflits
    npm install --legacy-peer-deps
    
    # Mettre à jour les packages critiques
    npm install nth-check@latest postcss@latest --save
    
    # Audit et correction
    npm audit fix --force
    
    cd -
}

# Projets à traiter
projects=(
    "/Users/bv/CascadeProjects/chicha-store/frontend"
    "/Users/bv/CascadeProjects/chicha-store/admin"
)

# Résolution pour chaque projet
for project in "${projects[@]}"; do
    resolve_dependencies "$project"
done

echo "✅ Résolution des dépendances terminée"
