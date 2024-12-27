import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Button, 
  Container, 
  CircularProgress 
} from '@mui/material';
import { ApiService, Product } from '../services/apiService';
import { useCart } from '../contexts/CartContext';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (id) {
          const fetchedProduct = await ApiService.getProductById(parseInt(id));
          setProduct(fetchedProduct);
          setLoading(false);
        }
      } catch (err) {
        setError('Impossible de charger les détails du produit');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h6" color="error">{error || 'Produit non trouvé'}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <img 
            src={`/images/chicha-${product.id}.jpg`} 
            alt={product.name} 
            style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }} 
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Catégorie : {product.category}
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom>
            {product.price.toFixed(2)} €
          </Typography>
          <Typography variant="body1" paragraph>
            Description détaillée de la chicha {product.name}. 
            Un modèle élégant et performant, parfait pour les amateurs de chichas.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={handleAddToCart}
            >
              Ajouter au panier
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              size="large"
            >
              Acheter maintenant
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetailPage;
