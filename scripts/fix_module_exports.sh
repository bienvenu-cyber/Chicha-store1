#!/bin/bash

# Répertoire des services et middleware
SERVICES_DIR="/Users/bv/CascadeProjects/chicha-store/backend/services"
MIDDLEWARE_DIR="/Users/bv/CascadeProjects/chicha-store/backend/middleware"
UTILS_DIR="/Users/bv/CascadeProjects/chicha-store/backend/utils"

# Fonction pour ajouter un export default si nécessaire
add_default_export() {
    local file="$1"
    
    # Vérifier si un export default existe déjà
    if ! grep -q "export default" "$file"; then
        echo "Ajout d'un export default à $file"
        
        # Trouver la dernière classe ou fonction
        last_class=$(grep -n "class " "$file" | tail -n 1 | cut -d ':' -f 1)
        last_function=$(grep -n "function " "$file" | tail -n 1 | cut -d ':' -f 1)
        
        if [ -n "$last_class" ]; then
            # Ajouter export default avant la définition de la classe
            sed -i '' "${last_class}s/^/export default /" "$file"
        elif [ -n "$last_function" ]; then
            # Ajouter export default avant la définition de la fonction
            sed -i '' "${last_function}s/^/export default /" "$file"
        else
            # Si aucune classe ou fonction, ajouter à la fin
            echo -e "\nexport default {};" >> "$file"
        fi
    fi
}

# Corriger les exports dans les services
for file in "$SERVICES_DIR"/*.js; do
    if [ -f "$file" ]; then
        add_default_export "$file"
    fi
done

# Corriger les exports dans les middlewares
for file in "$MIDDLEWARE_DIR"/*.js; do
    if [ -f "$file" ]; then
        # Gérer spécifiquement le middleware auth
        if [[ "$file" == *"auth.js" ]]; then
            # Transformer en export nommé et default
            sed -i '' 's/module.exports = {/export const { auth, adminAuth } = {/g' "$file"
            echo "export default { auth, adminAuth };" >> "$file"
        else
            add_default_export "$file"
        fi
    fi
done

# Corriger les utilitaires
for file in "$UTILS_DIR"/*.js; do
    if [ -f "$file" ]; then
        add_default_export "$file"
    fi
done

# Supprimer les méthodes privées qui causent des problèmes de parsing
find "$SERVICES_DIR" -name "*.js" -exec sed -i '' 's/private //g' {} \;

echo "Correction des exports et modules terminée !"
