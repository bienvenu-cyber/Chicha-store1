#!/bin/bash

cd /Users/bv/CascadeProjects/chicha-store/frontend

# Installer les dépendances manquantes
npm install @emotion/react @emotion/styled
npm install @types/react @types/react-dom
npm install typescript ts-loader

# Mettre à jour la configuration TypeScript
cat > tsconfig.json << EOL
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
EOL

# Mettre à jour Babel
cat > babel.config.js << EOL
module.exports = {
  presets: [
    '@babel/preset-env',
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript'
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ]
}
EOL

# Installer les plugins Babel supplémentaires
npm install --save-dev \
  @babel/preset-typescript \
  @babel/plugin-transform-runtime

# Réinstaller les dépendances
npm install
