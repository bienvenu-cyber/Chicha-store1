import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Données de test
const products = [
  { id: 1, name: 'Chicha Classic', price: 89.99, category: 'Traditional' },
  { id: 2, name: 'Moderne Deluxe', price: 129.99, category: 'Premium' },
  { id: 3, name: 'Voyage Compact', price: 59.99, category: 'Portable' }
];

app.use(cors());
app.use(express.json());

// Route de santé
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Route pour récupérer tous les produits
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Route pour récupérer un produit par ID
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Produit non trouvé' });
  }
});

// Route pour filtrer les produits par catégorie
app.get('/api/products/category/:category', (req, res) => {
  const filteredProducts = products.filter(
    p => p.category.toLowerCase() === req.params.category.toLowerCase()
  );
  res.json(filteredProducts);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
