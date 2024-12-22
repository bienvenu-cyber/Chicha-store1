const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function displayAdminDetails() {
  try {
    // Connexion à la base de données
    await mongoose.connect('mongodb://localhost:27017/chicha_store', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Récupérer tous les admins
    const admins = await Admin.find({}).select('-password -twoFactorSecret');

    if (admins.length === 0) {
      console.log('Aucun compte admin trouvé.');
      return;
    }

    console.log(`=== Détails des Comptes Admin (Total: ${admins.length}) ===`);

    admins.forEach((admin, index) => {
      console.log(`\n--- Admin #${index + 1} ---`);
      console.log(`ID: ${admin._id}`);
      console.log(`Username: ${admin.username}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Rôle: ${admin.role}`);
      console.log('Permissions:');
      Object.entries(admin.permissions).forEach(([key, value]) => {
        console.log(`  - ${key}: ${value}`);
      });
      console.log(`Dernière connexion: ${admin.lastLogin ? admin.lastLogin.toLocaleString() : 'Jamais'}`);
      console.log(`2FA activé: ${admin.twoFactorEnabled}`);
      console.log(`Compte verrouillé: ${admin.isLocked}`);
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des détails admin :', error);
  } finally {
    await mongoose.connection.close();
  }
}

displayAdminDetails();
