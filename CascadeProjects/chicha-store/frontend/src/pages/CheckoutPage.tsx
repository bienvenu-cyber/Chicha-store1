import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  TextField, 
  Button, 
  Paper, 
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { clearCart } from '../redux/cartSlice';
import { createOrder } from '../services/orderService';

interface ShippingInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

const CheckoutPage: React.FC = () => {
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France'
  });

  const [paymentMethod, setPaymentMethod] = useState('creditCard');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOrder({
        items: cart.items,
        total: cart.total,
        shippingInfo,
        paymentMethod
      });
      dispatch(clearCart());
      // Redirection ou message de confirmation
    } catch (error) {
      console.error('Erreur lors de la commande', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Finalisation de la commande
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informations de livraison
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Prénom"
                  name="firstName"
                  value={shippingInfo.firstName}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Nom"
                  name="lastName"
                  value={shippingInfo.lastName}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Adresse"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Ville"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Code Postal"
                  name="postalCode"
                  value={shippingInfo.postalCode}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Méthode de paiement
            </Typography>
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <FormControlLabel 
                value="creditCard" 
                control={<Radio />} 
                label="Carte de crédit" 
              />
              <FormControlLabel 
                value="paypal" 
                control={<Radio />} 
                label="PayPal" 
              />
              <FormControlLabel 
                value="bankTransfer" 
                control={<Radio />} 
                label="Virement bancaire" 
              />
            </RadioGroup>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Résumé de la commande
            </Typography>
            {cart.items.map((item) => (
              <Grid container key={item.id} sx={{ mb: 1 }}>
                <Grid item xs={8}>
                  <Typography variant="body2">
                    {item.name} x {item.quantity}
                  </Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">
                    {(item.price * item.quantity).toFixed(2)} €
                  </Typography>
                </Grid>
              </Grid>
            ))}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ textAlign: 'right' }}>
              Total : {cart.total.toFixed(2)} €
            </Typography>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={handleSubmitOrder}
            >
              Confirmer la commande
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;
