import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Route d'inscription
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const database = global.database;
    const usersCollection = database.collection('users');
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Utilisateur déjà existant' });
    }
    
    // Hacher le mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Créer l'utilisateur
    const newUser = {
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      role: 'user' // Role par défaut
    };
    
    const result = await usersCollection.insertOne(newUser);
    
    res.status(201).json({ 
      message: 'Utilisateur enregistré avec succès',
      userId: result.insertedId 
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
});

// Route de connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const database = global.database;
    const usersCollection = database.collection('users');
    
    // Trouver l'utilisateur
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe incorrect' });
    }
    
    // Générer un token JWT
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({ 
      token, 
      userId: user._id,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    console.error('Erreur lors de la connexion', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
});

// Route de réinitialisation de mot de passe
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const database = global.database;
    const usersCollection = database.collection('users');
    
    // Trouver l'utilisateur
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Hacher le nouveau mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Mettre à jour le mot de passe
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );
    
    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Erreur de réinitialisation de mot de passe', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
});

export default router;
