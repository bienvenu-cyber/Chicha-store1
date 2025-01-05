import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Grid
} from '@mui/material';
import { createProduct, updateProduct, Product } from '../services/productService';
import { useNotification } from '../contexts/NotificationContext';

interface ProductFormProps {
  product?: Product;
  onSubmitSuccess?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  product, 
  onSubmitSuccess 
}) => {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    category: product?.category || 'chicha',
    stock: product?.stock || 0,
    imageUrl: product?.imageUrl || '',
    specifications: {
      height: product?.specifications?.height || undefined,
      material: product?.specifications?.material || undefined,
      color: product?.specifications?.color || undefined
    }
  });

  const categories = [
    'chicha', 
    'tabac', 
    'charbon', 
    'accessoire'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Gestion des champs imbriqués
    if (name.startsWith('specifications.')) {
      const specKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'price' || name === 'stock' ? Number(value) : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (product) {
        // Mode mise à jour
        await updateProduct(product.id, formData);
        showNotification('Produit mis à jour avec succès', 'success');
      } else {
        // Mode création
        await createProduct(formData);
        showNotification('Produit créé avec succès', 'success');
      }
      
      // Réinitialiser le formulaire ou fermer
      onSubmitSuccess?.();
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Erreur lors de la sauvegarde', 
        'error'
      );
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {product ? 'Modifier un Produit' : 'Ajouter un Produit'}
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nom du Produit"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Catégorie</InputLabel>
            <Select
              name="category"
              value={formData.category}
              label="Catégorie"
              onChange={handleChange}
            >
              {categories.map(cat => (
                <MenuItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={6} sm={4}>
          <TextField
            fullWidth
            type="number"
            label="Prix"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>
        
        <Grid item xs={6} sm={4}>
          <TextField
            fullWidth
            type="number"
            label="Stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
            inputProps={{ min: 0 }}
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="URL de l'Image"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Hauteur (cm)"
            name="specifications.height"
            type="number"
            value={formData.specifications.height || ''}
            onChange={handleChange}
            inputProps={{ min: 0, step: 0.1 }}
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Matériau"
            name="specifications.material"
            value={formData.specifications.material || ''}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Couleur"
            name="specifications.color"
            value={formData.specifications.color || ''}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth
          >
            {product ? 'Mettre à jour' : 'Créer'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductForm;
