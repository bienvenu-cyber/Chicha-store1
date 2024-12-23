import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions, 
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Box,
  Chip,
  Stack
} from '@mui/material';
import { fetchProducts, Product } from '../services/productService';
import { useNotification } from '../contexts/NotificationContext.tsx';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState<number[]>([0, 500]);
  const { showNotification } = useNotification();

  const categories = [
    'chicha', 
    'tabac', 
    'charbon', 
    'accessoire'
  ];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
      } catch (error) {
        showNotification('Erreur lors du chargement des produits', 'error');
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    let result = products;

    // Filtrage par recherche
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrage par catégorie
    if (category) {
      result = result.filter(product => product.category === category);
    }

    // Filtrage par prix
    result = result.filter(
      product => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    setFilteredProducts(result);
  }, [searchTerm, category, priceRange, products]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setPriceRange([0, 500]);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" gutterBottom>
        Nos Produits
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Rechercher un produit"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Catégorie</InputLabel>
            <Select
              value={category}
              label="Catégorie"
              onChange={(e) => setCategory(e.target.value as string)}
            >
              <MenuItem value="">Toutes les catégories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography gutterBottom>Prix</Typography>
          <Slider
            value={priceRange}
            onChange={(e, newValue) => setPriceRange(newValue as number[])}
            valueLabelDisplay="auto"
            min={0}
            max={500}
          />
        </Grid>
      </Grid>

      {/* Filtres actifs */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1}>
          {searchTerm && (
            <Chip 
              label={`Recherche: ${searchTerm}`} 
              onDelete={() => setSearchTerm('')} 
            />
          )}
          {category && (
            <Chip 
              label={`Catégorie: ${category}`} 
              onDelete={() => setCategory('')} 
            />
          )}
          {(priceRange[0] !== 0 || priceRange[1] !== 500) && (
            <Chip 
              label={`Prix: ${priceRange[0]}€ - ${priceRange[1]}€`} 
              onDelete={() => setPriceRange([0, 500])} 
            />
          )}
          {(searchTerm || category || priceRange[0] !== 0 || priceRange[1] !== 500) && (
            <Chip 
              label="Effacer tous les filtres" 
              onDelete={handleClearFilters} 
              color="primary" 
            />
          )}
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {filteredProducts.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="h6" align="center">
              Aucun produit trouvé
            </Typography>
          </Grid>
        ) : (
          filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.imageUrl}
                  alt={product.name}
                />
                <CardContent>
                  <Typography variant="h5">{product.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.description}
                  </Typography>
                  <Typography variant="h6">{product.price} €</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">
                    Détails
                  </Button>
                  <Button size="small" color="secondary">
                    Ajouter au panier
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default ProductsPage;
