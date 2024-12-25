import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Modèles
import User from '../src/models/User.js.js.js';
import Product from '../src/models/Product.js.js.js';

dotenv.config();

const migrations = [
  {
    name: 'Add user roles',
    run: async () => {
      await User.updateMany(
        { role: { $exists: false } },
        { $set: { role: 'customer' } }
      );
    }
  },
  {
    name: 'Update product categories',
    run: async () => {
      await Product.updateMany(
        { category: { $exists: false } },
        { $set: { category: 'uncategorized' } }
      );
    }
  }
];

async function runMigrations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('🔌 Connexion à MongoDB établie');

    for (const migration of migrations) {
      console.log(`🚀 Exécution de la migration : ${migration.name}`);
      await migration.run();
      console.log(`✅ Migration ${migration.name} terminée`);
    }

    console.log('🎉 Toutes les migrations ont été effectuées avec succès');
  } catch (error) {
    console.error('❌ Erreur lors des migrations :', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

runMigrations();
