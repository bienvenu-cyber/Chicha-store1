import React, { useState, useEffect } from 'react';
import { ApiService, Product } from '../services/apiService';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CircularProgress,
  CardActionArea
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await ApiService.getAllProducts();
        setProducts(fetchedProducts);
        setLoading(false);
      } catch (err) {
        setError('Impossible de charger les produits');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Nos Chichas
      </Typography>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card>
              <CardActionArea onClick={() => handleProductClick(product.id)}>
                <CardMedia
                  component="img"
                  height="200"
                  image={`/images/chicha-${product.id}.jpg`}
                  alt={product.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Catégorie : {product.category}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {product.price.toFixed(2)} €
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProductList;
