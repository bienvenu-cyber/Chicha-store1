import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';

dotenv.config();

// Services
const WebSocketService = import('./services/websocketService');
const recommendationService = import('./services/recommendationService');

// Routes
const productRoutes = import('./routes/products');
const userRoutes = import('./routes/users');
const orderRoutes = import('./routes/orders');
const paymentRoutes = import('./routes/payments');
const mobilePaymentRoutes = import('./routes/mobilePayments');
const cryptoPaymentRoutes = import('./routes/cryptoPayments');
const authRoutes = import('./routes/auth');

const app = express();
app.use(helmet()); // Ajouter cette ligne pour la sécurité
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connecté à MongoDB'))
.catch(err => console.error('Erreur de connexion MongoDB', err));

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
