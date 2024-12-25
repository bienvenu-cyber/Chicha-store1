import mongoose from 'mongoose';
import Admin from '../models/Admin.js.js';

async function createSuperAdmin() {
  try {
    // Connexion à la base de données
    await mongoose.connect('mongodb://localhost:27017/chicha_store', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Vérifier s'il existe déjà un SuperAdmin
    const existingAdmin = await Admin.findOne({ role: 'SuperAdmin' });
    
    if (existingAdmin) {
      console.log('Un SuperAdmin existe déjà.');
      await mongoose.connection.close();
      return;
    }

    // Création du SuperAdmin
    const superAdmin = new Admin({
      username: 'chicha_superadmin',
      email: 'admin@chicha-store.com',
      password: 'ChichaAdmin2024!', // À changer impérativement lors de la première connexion
      role: 'SuperAdmin',
      permissions: {
        produits: true,
        utilisateurs: true,
        commandes: true,
        marketing: true,
        finance: true
      },
      twoFactorEnabled: false
    });

    await superAdmin.save();

    console.log('SuperAdmin créé avec succès :');
    console.log(`Username: ${superAdmin.username}`);
    console.log(`Email: ${superAdmin.email}`);
    console.log('Mot de passe : ChichaAdmin2024! (à changer impérativement)');

  } catch (error) {
    console.error('Erreur lors de la création du SuperAdmin :', error);
  } finally {
    await mongoose.connection.close();
  }
}

createSuperAdmin();
