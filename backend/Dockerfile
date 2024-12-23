# Utiliser une image Node officielle comme base
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY . .

# Compiler TypeScript si nécessaire
RUN npm run build

# Exposer le port du serveur
EXPOSE 3000

# Commande pour démarrer le serveur
CMD ["npm", "start"]
