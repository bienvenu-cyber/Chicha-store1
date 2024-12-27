#!/bin/bash

# Répertoire du projet
PROJECT_DIR="/Users/bv/CascadeProjects/chicha-store"

# Mise à jour globale des dépendances
npm install -g npm-check-updates snyk

# Frontend
cd $PROJECT_DIR/frontend
npm install npm-check-updates
npx npm-check-updates -u
npm install
npm audit fix --force

# Backend
cd $PROJECT_DIR/backend
npm install npm-check-updates
npx npm-check-updates -u
npm install
npm audit fix --force

# Migration ES Modules
find $PROJECT_DIR -type f -name "*.js" -exec sed -i '' 's/require(/import(/g' {} \;
find $PROJECT_DIR -type f -name "*.js" -exec sed -i '' 's/module.exports/export default/g' {} \;

# Mise à jour de la configuration Babel
cat > $PROJECT_DIR/babel.config.js << EOL
export default {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current'
      }
    }]
  ],
  plugins: [
    '@babel/plugin-transform-modules-commonjs'
  ]
}
EOL

# Configuration des tests
cat > $PROJECT_DIR/jest.config.js << EOL
export default {
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  collectCoverage: true,
  coverageReporters: ['text', 'lcov'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
}
EOL

# Configuration CI/CD
mkdir -p $PROJECT_DIR/.github/workflows
cat > $PROJECT_DIR/.github/workflows/ci.yml << EOL
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18.x'
    - run: npm ci
    - run: npm test
    - run: npm run lint
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3

  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Run Snyk to check for vulnerabilities
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
EOL

# Performance Monitoring
mkdir -p $PROJECT_DIR/performance
cat > $PROJECT_DIR/performance/benchmark.js << EOL
import autocannon from 'autocannon';

async function runLoadTest() {
  const result = await autocannon({
    url: 'http://localhost:3000',
    connections: 100,
    duration: 10
  });
  console.log(result);
}

runLoadTest();
EOL

# Optimisation Réseau
mkdir -p $PROJECT_DIR/backend/middleware
cat > $PROJECT_DIR/backend/middleware/networkOptimization.js << EOL
export default function networkOptimization(req, res, next) {
  res.setHeader('Content-Encoding', 'gzip');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('X-Response-Time', Date.now());
  next();
}
EOL

echo "Mise à jour et optimisation terminées !"
