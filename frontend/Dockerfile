# Utiliser une image Node officielle comme base
FROM node:18-alpine AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances avec --legacy-peer-deps
RUN npm install --legacy-peer-deps

# Copier le reste du code source
COPY . .

# Construire l'application
RUN npm run build

# Image de production
FROM nginx:alpine

# Copier les fichiers construits
COPY --from=build /app/build /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Commande par défaut
CMD ["nginx", "-g", "daemon off;"]