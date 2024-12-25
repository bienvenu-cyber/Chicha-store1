#!/bin/bash

# Répertoire racine du backend
BACKEND_DIR="/Users/bv/CascadeProjects/chicha-store/backend"

# Convertir tous les require en import
find "$BACKEND_DIR" -type f -name "*.js" | while read -r file; do
    # Ignorer les fichiers dans node_modules
    if [[ "$file" != *"/node_modules/"* ]]; then
        # Remplacer require par import
        sed -i '' 's/const \([a-zA-Z0-9_]*\) = require(\([^)]*\));/import \1 from \2;/g' "$file"
        
        # Remplacer les imports de destructuration
        sed -i '' 's/const { \([^}]*\) } = require(\([^)]*\));/import { \1 } from \2;/g' "$file"
        
        # Ajouter .js aux imports locaux si nécessaire
        sed -i '' 's/from \(['"'"'"]\.\/[^'"'"'".]*\)\(['"'"'"]\)/from \1.js\2/g' "$file"
    fi
done

# Corriger le middleware auth
AUTH_MIDDLEWARE="$BACKEND_DIR/middleware/auth.js"
if [ -f "$AUTH_MIDDLEWARE" ]; then
    # Nettoyer les exports multiples
    sed -i '' '/export const { auth, adminAuth } = { auth, adminAuth };/d' "$AUTH_MIDDLEWARE"
    sed -i '' '$a\
export { auth, adminAuth };' "$AUTH_MIDDLEWARE"
fi

echo "Correction des imports et exports terminée !"
