#!/bin/bash

cd /Users/bv/CascadeProjects/chicha-store/frontend

# Mise à jour des dépendances Babel
npm install --save-dev \
  @babel/plugin-transform-private-methods \
  @babel/plugin-transform-numeric-separator \
  @babel/plugin-transform-class-properties \
  @babel/plugin-transform-nullish-coalescing-operator \
  @babel/plugin-transform-optional-chaining

# Mise à jour de react-scripts
npm install react-scripts@latest

# Nettoyage des dépendances obsolètes
npm prune
