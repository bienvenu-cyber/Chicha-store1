import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Charger les variables d'environnement
dotenv.config({ path: '.env.test' });

// Configuration globale pour les tests
global.mongoose = mongoose;
global.jwt = jwt;

// Configuration de la connexion à la base de données de test
beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

afterAll(async () => {
    await mongoose.connection.close();
});
