import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CircularProgress,
  CardActionArea,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Chip,
  Stack,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, Product } from '../services/productService';
import { useNotification } from '../contexts/NotificationContext';
import { useCart } from '../contexts/CartContext'; 

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { addToCart } = useCart(); 

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('name');
  const [page, setPage] = useState(1);
  const productsPerPage = 12;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
        setLoading(false);
      } catch (err) {
        setError('Impossible de charger les produits');
        showNotification('Erreur de chargement des produits', 'error');
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let result = products;

    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (category) {
      result = result.filter(product => product.category === category);
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
      default:
        result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, searchTerm, category, sortBy]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (page - 1) * productsPerPage;
    return filteredAndSortedProducts.slice(startIndex, startIndex + productsPerPage);
  }, [filteredAndSortedProducts, page]);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    showNotification(`${product.name} ajouté au panier`, 'success');
  };

  const categories = [
    'chicha', 
    'tabac', 
    'charbon', 
    'accessoire'
  ];

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
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2, 
        mb: 3, 
        alignItems: 'center' 
      }}>
        <TextField
          label="Rechercher des produits"
          variant="outlined"
          fullWidth
          sx={{ maxWidth: 300 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Catégorie</InputLabel>
          <Select
            value={category}
            label="Catégorie"
            onChange={(e) => setCategory(e.target.value)}
          >
            <MenuItem value="">Toutes les catégories</MenuItem>
            {categories.map(cat => (
              <MenuItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Trier par</InputLabel>
          <Select
            value={sortBy}
            label="Trier par"
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <MenuItem value="name">Nom</MenuItem>
            <MenuItem value="price-asc">Prix croissant</MenuItem>
            <MenuItem value="price-desc">Prix décroissant</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {category && (
          <Chip 
            label={`Catégorie: ${category}`} 
            onDelete={() => setCategory('')} 
          />
        )}
        {searchTerm && (
          <Chip 
            label={`Recherche: ${searchTerm}`} 
            onDelete={() => setSearchTerm('')} 
          />
        )}
      </Stack>

      <Grid container spacing={3}>
        {paginatedProducts.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="h6" align="center">
              Aucun produit trouvé
            </Typography>
          </Grid>
        ) : (
          paginatedProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea onClick={() => handleProductClick(product.id)}>
                  <CardMedia
                    component="img"
                    height="250"
                    image={product.imageUrl || '/default-product.jpg'}
                    alt={product.name}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product.description.length > 100 
                        ? `${product.description.slice(0, 100)}...` 
                        : product.description}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      {product.price.toFixed(2)} €
                    </Typography>
                    {product.stock > 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        En stock : {product.stock}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="error">
                        Rupture de stock
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>
                <Box sx={{ p: 2, mt: 'auto' }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    disabled={product.stock === 0}
                    onClick={() => handleAddToCart(product)}
                  >
                    Ajouter au panier
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        mt: 4 
      }}>
        <Pagination
          count={Math.ceil(filteredAndSortedProducts.length / productsPerPage)}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default ProductList;
