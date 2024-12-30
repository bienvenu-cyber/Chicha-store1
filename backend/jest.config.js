import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Convertir l'URL du module en chemin de fichier
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement de test
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default {
    // Indique à Jest d'utiliser babel-jest pour la transpilation
    transform: {
        '^.+\\.js$': ['babel-jest', { 
            presets: [
                ['@babel/preset-env', { 
                    targets: { node: 'current' },
                    modules: 'commonjs' 
                }]
            ]
        }]
    },
    
    // Spécifie les extensions de fichiers à traiter
    moduleFileExtensions: ['js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx', 'json', 'node'],
    
    // Dossier de test par défaut
    testMatch: ['**/tests/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
    
    // Environnement de test
    testEnvironment: 'node',
    
    // Configuration pour les imports de modules
    moduleNameMapper: {
        '^mongoose$': '<rootDir>/node_modules/mongoose/index.js',
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    
    // Configuration de couverture de code
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },

    // Configurer les modules globaux
    setupFiles: [
        '<rootDir>/tests/setupTests.js'
    ],

    // Transformations supplémentaires
    transformIgnorePatterns: [
        '/node_modules/(?!mongoose)/'
    ],
    
    // Configuration globale pour Babel
    globals: {
        'babel-jest': {
            useESM: true
        }
    }
};
