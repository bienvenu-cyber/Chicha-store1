import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Button, 
  Box, 
  Rating, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel 
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { fetchProductById, Product } from '../services/productService';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState<number | null>(4);

  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        const fetchedProduct = await fetchProductById(id);
        setProduct(fetchedProduct);
      }
    };
    loadProduct();
  }, [id]);

  if (!product) return <Typography>Chargement...</Typography>;

  return (
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }} 
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom>
            {product.price} €
          </Typography>
          <Typography variant="body1" paragraph>
            {product.description}
          </Typography>
          
          <Box display="flex" alignItems="center" mb={2}>
            <Typography variant="body2" mr={2}>Note :</Typography>
            <Rating 
              name="product-rating" 
              value={rating} 
              onChange={(event, newValue) => setRating(newValue)}
            />
          </Box>

          <Box display="flex" alignItems="center" mb={2}>
            <FormControl variant="outlined" sx={{ minWidth: 120, mr: 2 }}>
              <InputLabel>Quantité</InputLabel>
              <Select
                value={quantity}
                label="Quantité"
                onChange={(e) => setQuantity(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <MenuItem key={num} value={num}>
                    {num}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button 
              variant="contained" 
              color="primary" 
              size="large"
            >
              Ajouter au panier
            </Button>
          </Box>

          <Typography variant="subtitle1" color="textSecondary">
            Catégorie : {product.category}
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetailPage;
