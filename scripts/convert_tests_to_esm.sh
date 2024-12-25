#!/bin/bash

# Répertoire des tests
TEST_DIR="/Users/bv/CascadeProjects/chicha-store/backend/__tests__"

# Fonction pour convertir un fichier de test
convert_test_file() {
    local file="$1"
    echo "Conversion de $file"

    # Remplacer require par import
    sed -i '' 's/const \([a-zA-Z0-9_]*\) = require(\([^)]*\));/import \1 from \2;/g' "$file"
    
    # Remplacer les imports de destructuration
    sed -i '' 's/const { \([^}]*\) } = require(\([^)]*\));/import { \1 } from \2;/g' "$file"
    
    # Ajouter .js aux imports locaux si nécessaire
    sed -i '' 's/from \(['"'"'"]\.\/[^'"'"'".]*\)\(['"'"'"]\)/from \1.js\2/g' "$file"
    
    # Convertir les imports de modules Node.js
    sed -i '' 's/const \([a-zA-Z0-9_]*\) = require(\x27node:\([^)]*\)\x27);/import \1 from \x27node:\2\x27;/g' "$file"
    sed -i '' 's/const \([a-zA-Z0-9_]*\) = require(\x22node:\([^)]*\)\x22);/import \1 from \x22node:\2\x22;/g' "$file"
}

# Parcourir tous les fichiers .js dans le répertoire des tests
find "$TEST_DIR" -name "*.js" | while read -r file; do
    if [ -f "$file" ]; then
        convert_test_file "$file"
    fi
done

echo "Conversion des tests terminée !"
