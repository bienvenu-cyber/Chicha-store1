import mongoose from 'mongoose';
import Admin from '../models/Admin.js.js';

async function createMultipleAdmins() {
  try {
    // Connexion à la base de données
    await mongoose.connect('mongodb://localhost:27017/chicha_store', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Supprimer tous les comptes admin existants
    await Admin.deleteMany({});

    // Définition des admins à créer
    const adminsToCreate = [
      {
        username: 'chicha_superadmin',
        email: 'superadmin@chicha-store.com',
        password: 'ChichaSuperAdmin2024!',
        role: 'SuperAdmin',
        permissions: {
          produits: true,
          utilisateurs: true,
          commandes: true,
          marketing: true,
          finance: true
        }
      },
      {
        username: 'chicha_produit_admin',
        email: 'produit_admin@chicha-store.com',
        password: 'ChichaProduitAdmin2024!',
        role: 'AdminProduit',
        permissions: {
          produits: true,
          utilisateurs: false,
          commandes: false,
          marketing: false,
          finance: false
        }
      }
    ];

    // Création des admins
    const createdAdmins = await Admin.create(adminsToCreate);

    console.log('Admins créés avec succès :');
    createdAdmins.forEach(admin => {
      console.log(`\n--- Admin ---`);
      console.log(`Username: ${admin.username}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Rôle: ${admin.role}`);
      console.log('Permissions:');
      Object.entries(admin.permissions).forEach(([key, value]) => {
        console.log(`  - ${key}: ${value}`);
      });
    });

  } catch (error) {
    console.error('Erreur lors de la création des admins :', error);
  } finally {
    await mongoose.connection.close();
  }
}

createMultipleAdmins();
