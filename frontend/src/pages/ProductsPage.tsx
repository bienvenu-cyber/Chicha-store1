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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import { fetchProducts, Product, deleteProduct } from '../services/productService';
import { useNotification } from '../contexts/NotificationContext';
import ProductForm from '../components/ProductForm';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState<number[]>([0, 500]);
  const { showNotification } = useNotification();
  
  // Nouveaux états pour la gestion du formulaire
  const [openProductForm, setOpenProductForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

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

  // Nouvelle fonction pour supprimer un produit
  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      showNotification('Produit supprimé avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la suppression du produit', 'error');
    }
  };

  // Nouvelle fonction pour ouvrir le formulaire de modification
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setOpenProductForm(true);
  };

  // Fonction de réussite du formulaire
  const handleSubmitSuccess = () => {
    setOpenProductForm(false);
    setSelectedProduct(undefined);
    // Recharger les produits
    fetchProducts().then(fetchedProducts => {
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
    });
  };

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
      {/* Bouton Ajouter Produit */}
      <Box sx={{ my: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => {
            setSelectedProduct(undefined);
            setOpenProductForm(true);
          }}
        >
          Ajouter un Produit
        </Button>
      </Box>

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

      {/* Dialog pour le formulaire de produit */}
      <Dialog 
        open={openProductForm} 
        onClose={() => {
          setOpenProductForm(false);
          setSelectedProduct(undefined);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedProduct ? 'Modifier un Produit' : 'Ajouter un Produit'}
        </DialogTitle>
        <DialogContent>
          <ProductForm 
            product={selectedProduct} 
            onSubmitSuccess={handleSubmitSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Modification de la liste des produits pour ajouter des actions */}
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
                  height="194"
                  image={product.imageUrl || '/default-product.jpg'}
                  alt={product.name}
                />
                <CardContent>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.description}
                  </Typography>
                  <Typography variant="subtitle1">
                    Prix: {product.price} €
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    onClick={() => handleEditProduct(product)}
                  >
                    Modifier
                  </Button>
                  <Button 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    Supprimer
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
