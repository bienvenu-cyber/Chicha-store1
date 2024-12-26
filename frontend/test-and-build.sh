#!/bin/bash

cd /Users/bv/CascadeProjects/chicha-store/frontend

# Mise à jour des dépendances de test
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event

# Configuration pour ignorer les erreurs de module
export NODE_OPTIONS=--experimental-vm-modules

# Lancement des tests
npm test -- --maxWorkers=2

# Build de production
npm run build
