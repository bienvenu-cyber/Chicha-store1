import React from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  IconButton, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper 
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Remove as RemoveIcon 
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { 
  removeFromCart, 
  updateQuantity 
} from '../redux/cartSlice';

const CartPage: React.FC = () => {
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ id, quantity: newQuantity }));
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Votre Panier
      </Typography>
      
      {cart.items.length === 0 ? (
        <Typography variant="body1" align="center">
          Votre panier est vide
        </Typography>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Produit</TableCell>
                    <TableCell align="right">Prix</TableCell>
                    <TableCell align="center">Quantité</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          style={{ width: 50, height: 50, objectFit: 'cover' }} 
                        />
                        {item.name}
                      </TableCell>
                      <TableCell align="right">{item.price} €</TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small" 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <RemoveIcon />
                        </IconButton>
                        {item.quantity}
                        <IconButton 
                          size="small" 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <AddIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell align="right">
                        {(item.price * item.quantity).toFixed(2)} €
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color="secondary" 
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Résumé de la commande
                </Typography>
                <Typography variant="body1">
                  Total : {cart.total.toFixed(2)} €
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  sx={{ mt: 2 }}
                >
                  Passer la commande
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default CartPage;
