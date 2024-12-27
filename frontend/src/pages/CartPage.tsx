import React from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
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
import { Add, Remove, Delete } from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';

const CartPage: React.FC = () => {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotalPrice 
  } = useCart();

  if (cart.length === 0) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h4" gutterBottom>
          Votre panier est vide
        </Typography>
        <Button 
          component={Link} 
          to="/" 
          variant="contained" 
          color="primary"
        >
          Continuer mes achats
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Votre Panier
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Produit</TableCell>
              <TableCell align="center">Prix</TableCell>
              <TableCell align="center">Quantité</TableCell>
              <TableCell align="center">Total</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cart.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <img 
                      src={`/images/chicha-${item.id}.jpg`} 
                      alt={item.name} 
                      style={{ width: 80, height: 80, objectFit: 'cover', marginRight: 16 }}
                    />
                    <Typography variant="subtitle1">{item.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">{item.price.toFixed(2)} €</TableCell>
                <TableCell align="center">
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <IconButton 
                      size="small" 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Remove />
                    </IconButton>
                    <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Add />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  {(item.price * item.quantity).toFixed(2)} €
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    color="error" 
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={clearCart}
        >
          Vider le panier
        </Button>
        <Box>
          <Typography variant="h6">
            Total : {getTotalPrice().toFixed(2)} €
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            sx={{ mt: 2 }}
          >
            Procéder au paiement
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default CartPage;
