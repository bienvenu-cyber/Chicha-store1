# Étape de build du frontend
FROM node:16-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# Étape de build du backend
FROM node:16-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend ./

# Étape finale
FROM node:16-alpine
WORKDIR /app
COPY --from=frontend-build /app/frontend/build ./frontend/build
COPY --from=backend-build /app/backend ./backend
COPY package*.json ./

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Installation des dépendances de production
RUN npm install --only=production

# Exposition du port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]
