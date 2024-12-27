import mongoose from 'mongoose';
import User from '../models/User.js.js';
import('dotenv').config();

async function createAdminUser() {
    try {
        // Connexion à la base de données
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Vérifier si un admin existe déjà
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Un compte admin existe déjà');
            mongoose.connection.close();
            return;
        }

        // Créer un nouvel admin
        const adminUser = new User({
            firstName: 'Admin',
            lastName: 'Chicha Store',
            email: 'admin@chichastore.com',
            password: 'AdminChicha2024!', // Mot de passe à changer immédiatement
            role: 'admin'
        });

        await adminUser.save();
        console.log('Compte admin créé avec succès');
        mongoose.connection.close();
    } catch (error) {
        console.error('Erreur lors de la création du compte admin:', error);
        mongoose.connection.close();
    }
}

createAdminUser();
