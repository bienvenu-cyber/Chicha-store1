#!/bin/bash

# Fonction de mise à jour des packages
update_package() {
    local project_path=$1
    echo "🔄 Mise à jour des packages dans $project_path"
    
    cd "$project_path"
    
    # Mettre à jour nth-check
    npm install nth-check@latest
    
    # Mettre à jour postcss
    npm install postcss@latest
    
    # Audit et correction
    npm audit fix --force
    
    cd -
}

# Projets à mettre à jour
projects=(
    "/Users/bv/CascadeProjects/chicha-store/frontend"
    "/Users/bv/CascadeProjects/chicha-store/admin"
)

# Mise à jour de chaque projet
for project in "${projects[@]}"; do
    update_package "$project"
done

echo "✅ Mise à jour terminée"
