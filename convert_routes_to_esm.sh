#!/bin/bash

# Répertoire des routes
ROUTES_DIR="/Users/bv/CascadeProjects/chicha-store/backend/routes"

# Fonction pour convertir un fichier
convert_file() {
    local file="$1"
    echo "Conversion de $file"

    # Remplacer require par import
    sed -i '' 's/const \([a-zA-Z0-9_]*\) = require(\([^)]*\));/import \1 from \2;/g' "$file"

    # Remplacer module.exports par export default
    sed -i '' 's/module\.exports = \([a-zA-Z0-9_]*\);/export default \1;/g' "$file"

    # Ajouter l'extension .js aux imports locaux si nécessaire
    sed -i '' 's/from \(['"'"'"]\.\/[^'"'"'".]*\)\(['"'"'"]\)/from \1.js\2/g' "$file"

    # Convertir les exports de fonction/classe
    sed -i '' 's/^module\.exports = function/export default function/g' "$file"
    sed -i '' 's/^module\.exports = class/export default class/g' "$file"
}

# Parcourir tous les fichiers .js dans le répertoire des routes
for file in "$ROUTES_DIR"/*.js; do
    if [ -f "$file" ]; then
        convert_file "$file"
    fi
done

echo "Conversion terminée !"
