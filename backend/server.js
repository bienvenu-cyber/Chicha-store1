import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration des chemins pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config();

// Importer les routes dynamiquement
const routeFiles = [
  'auth.js',
  'products.js',
  'users.js',
  'orders.js',
  'payments.js',
  'mobilePayments.js',
  'cryptoPayments.js',
];

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Connexion à MongoDB
async function connectToDatabase() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    await client.connect();
    console.log('Connecté à MongoDB');
    
    // Stocker la connexion globalement
    global.database = client.db(); // Utilise la base de données par défaut
    
    // Charger dynamiquement les routes
    for (const routeFile of routeFiles) {
      const routePath = path.join(__dirname, 'routes', `${routeFile}Routes.js`);
      const { default: route } = await import(routePath);
      
      // Extraire le nom de la route à partir du nom du fichier
      const routeName = routeFile;
      app.use(`/api/${routeName}`, route);
    }
    
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

    // Démarrer le serveur
    server.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  } catch (error) {
    console.error('Erreur de connexion à MongoDB', error);
    process.exit(1);
  }
}

connectToDatabase();
