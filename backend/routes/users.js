const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Inscription
router.post('/register', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Connexion
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).send({ error: 'Email ou mot de passe incorrect' });
        }

        const isMatch = await user.comparePassword(req.body.password);
        if (!isMatch) {
            return res.status(401).send({ error: 'Email ou mot de passe incorrect' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ user, token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Obtenir le profil
router.get('/profile', auth, async (req, res) => {
    res.json(req.user);
});

// Mettre à jour le profil
router.patch('/profile', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['firstName', 'lastName', 'email', 'password', 'address'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Mises à jour invalides' });
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.json(req.user);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Ajouter au wishlist
router.post('/wishlist', auth, async (req, res) => {
    try {
        if (!req.user.wishlist.includes(req.body.productId)) {
            req.user.wishlist.push(req.body.productId);
            await req.user.save();
        }
        res.json(req.user);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Retirer du wishlist
router.delete('/wishlist/:productId', auth, async (req, res) => {
    try {
        req.user.wishlist = req.user.wishlist.filter(id => id.toString() !== req.params.productId);
        await req.user.save();
        res.json(req.user);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Créer un compte admin
router.post('/create-admin', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        
        // Vérifier si un admin existe déjà
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            return res.status(400).send({ error: 'Un compte admin existe déjà' });
        }

        // Créer un nouvel utilisateur avec le rôle admin
        const user = new User({
            firstName,
            lastName,
            email,
            password,
            role: 'admin'
        });

        await user.save();
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Liste des utilisateurs (admin seulement)
router.get('/', adminAuth, async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
