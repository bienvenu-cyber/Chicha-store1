const express = require('express');
const http = require('http');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

// Services
const WebSocketService = require('./services/websocketService');
const recommendationService = require('./services/recommendationService');

// Routes
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const mobilePaymentRoutes = require('./routes/mobilePayments');
const cryptoPaymentRoutes = require('./routes/cryptoPayments');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Connexion à MongoDB
const connectToDatabase = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    
    await client.connect();
    console.log('Connecté à MongoDB');
    
    const database = client.db(); // Utilise la base de données par défaut
    
    // Stocker la connexion globalement si nécessaire
    global.mongoClient = client;
    global.database = database;
    
    return database;
  } catch (error) {
    console.error('Erreur de connexion MongoDB', error);
    process.exit(1);
  }
};

// Initialiser la connexion à la base de données
connectToDatabase();

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/mobile-payments', mobilePaymentRoutes);
app.use('/api/crypto-payments', cryptoPaymentRoutes);
app.use('/api/auth', authRoutes);

// Routes de recommandation
app.post('/api/recommendations/personalized', async (req, res) => {
  try {
    const { userId, context } = req.body;
    const recommendations = await recommendationService.getPersonalizedRecommendations(
      userId, 
      context
    );
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Erreur de recommandation' });
  }
});

app.get('/api/recommendations/related/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const relatedProducts = await recommendationService.getRelatedProducts(productId);
    res.json(relatedProducts);
  } catch (error) {
    res.status(500).json({ error: 'Erreur de produits similaires' });
  }
});

app.post('/api/recommendations/browsing', async (req, res) => {
  try {
    const { lastViewedProducts } = req.body;
    const recommendations = await recommendationService.getBrowsingRecommendations(
      lastViewedProducts
    );
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Erreur de recommandations de navigation' });
  }
});

// Route pour le frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Initialisation WebSocket
const websocketService = new WebSocketService(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
