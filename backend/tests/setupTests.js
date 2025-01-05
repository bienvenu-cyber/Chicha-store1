const dotenv = require('dotenv');
const { beforeAll, afterAll } = require('@jest/globals');
const mongoose = require('mongoose');

// Charger les variables d'environnement de test
dotenv.config({ path: '.env.test' });

// Configuration globale avant tous les tests
beforeAll(async () => {
    // Connexion à la base de données de test
    await mongoose.connect(process.env.MONGODB_TEST_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

// Configuration globale après tous les tests
afterAll(async () => {
    // Fermeture de la connexion à la base de données
    await mongoose.connection.close();
});

module.exports = { mongoose };
