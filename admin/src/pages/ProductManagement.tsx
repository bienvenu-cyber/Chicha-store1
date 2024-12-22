import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Typography, 
    Button, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon, 
    Add as AddIcon 
} from '@mui/icons-material';
import { productService } from '../services/productService';
import { Product, ProductCategory } from '../types/Product';

const ProductManagement: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        category: 'chicha' as ProductCategory,
        imageUrl: ''
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await productService.getAll();
            setProducts(data);
        } catch (error) {
            console.error('Erreur lors du chargement des produits', error);
        }
    };

    const handleOpenDialog = (product?: Product) => {
        if (product) {
            setCurrentProduct(product);
            setIsEditing(true);
        } else {
            setCurrentProduct({
                name: '',
                description: '',
                price: 0,
                stock: 0,
                category: 'chicha' as ProductCategory,
                imageUrl: ''
            });
            setIsEditing(false);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentProduct({
            name: '',
            description: '',
            price: 0,
            stock: 0,
            category: 'chicha' as ProductCategory,
            imageUrl: ''
        });
    };

    const handleSaveProduct = async () => {
        try {
            if (isEditing && currentProduct._id) {
                await productService.update(currentProduct._id, currentProduct);
            } else {
                await productService.create(currentProduct as Product);
            }
            fetchProducts();
            handleCloseDialog();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du produit', error);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        try {
            await productService.delete(id);
            fetchProducts();
        } catch (error) {
            console.error('Erreur lors de la suppression du produit', error);
        }
    };

    return (
        <Container maxWidth="xl">
            <Typography variant="h4" sx={{ mb: 4 }}>
                Gestion des Produits
            </Typography>

            <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => handleOpenDialog()}
                sx={{ mb: 2 }}
            >
                Ajouter un Produit
            </Button>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nom</TableCell>
                            <TableCell>Catégorie</TableCell>
                            <TableCell>Prix</TableCell>
                            <TableCell>Stock</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product._id}>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>{product.price} €</TableCell>
                                <TableCell>{product.stock}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpenDialog(product)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeleteProduct(product._id!)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {isEditing ? 'Modifier le Produit' : 'Ajouter un Produit'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Nom"
                        fullWidth
                        value={currentProduct.name || ''}
                        onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        value={currentProduct.description || ''}
                        onChange={(e) => setCurrentProduct({...currentProduct, description: e.target.value})}
                    />
                    <TextField
                        margin="dense"
                        label="Prix"
                        type="number"
                        fullWidth
                        value={currentProduct.price || ''}
                        onChange={(e) => setCurrentProduct({...currentProduct, price: Number(e.target.value)})}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Catégorie</InputLabel>
                        <Select
                            value={currentProduct.category || 'chicha'}
                            label="Catégorie"
                            onChange={(e) => setCurrentProduct({...currentProduct, category: e.target.value as ProductCategory})}
                        >
                            <MenuItem value="chicha">Chicha</MenuItem>
                            <MenuItem value="tabac">Tabac</MenuItem>
                            <MenuItem value="charbon">Charbon</MenuItem>
                            <MenuItem value="accessoire">Accessoire</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        label="Stock"
                        type="number"
                        fullWidth
                        value={currentProduct.stock || ''}
                        onChange={(e) => setCurrentProduct({...currentProduct, stock: Number(e.target.value)})}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Annuler</Button>
                    <Button onClick={handleSaveProduct} variant="contained">
                        Enregistrer
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ProductManagement;
