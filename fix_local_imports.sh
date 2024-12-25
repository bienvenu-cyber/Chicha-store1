#!/bin/bash

# Répertoires à parcourir
DIRS=(
    "/Users/bv/CascadeProjects/chicha-store/backend/routes"
    "/Users/bv/CascadeProjects/chicha-store/backend/models"
    "/Users/bv/CascadeProjects/chicha-store/backend/controllers"
    "/Users/bv/CascadeProjects/chicha-store/backend/services"
)

# Fonction pour ajouter les extensions .js aux imports locaux
fix_imports() {
    local file="$1"
    echo "Correction des imports dans $file"

    # Ajouter .js aux imports locaux qui ne l'ont pas déjà
    sed -i '' 's/from \(['"'"'"]\.\/[^'"'"'".]*\)\([^.js'"'"'"]\)/from \1.js\2/g' "$file"
    
    # Corriger les imports de modèles et de routes
    sed -i '' 's/from '"'"'\.\/\([^'"'"'.]*\)'"'"'/from '"'"'\.\/\1.js'"'"'/g' "$file"
}

# Parcourir les répertoires
for dir in "${DIRS[@]}"; do
    echo "Traitement du répertoire $dir"
    for file in "$dir"/*.js; do
        if [ -f "$file" ]; then
            fix_imports "$file"
        fi
    done
done

echo "Correction des imports terminée !"
