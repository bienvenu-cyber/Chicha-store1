import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions 
} from '@mui/material';
import { useMobileMoney } from '../hooks/useMobileMoney';
import { useOrder } from '../hooks/useOrder';

interface MobileMoneyPaymentProps {
  orderId: string;
  totalAmount: number;
  onPaymentSuccess: () => void;
}

export const MobileMoneyPayment: React.FC<MobileMoneyPaymentProps> = ({
  orderId,
  totalAmount,
  onPaymentSuccess
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const { 
    providers, 
    transaction,
    loading,
    fetchMobileMoneyProviders,
    initiateMobileMoneyPayment,
    checkMobileMoneyPaymentStatus
  } = useMobileMoney();

  const { order } = useOrder(orderId);

  useEffect(() => {
    fetchMobileMoneyProviders();
  }, []);

  const handleProviderSelect = (provider: string) => {
    setSelectedProvider(provider);
    setIsPaymentDialogOpen(true);
  };

  const handleInitiatePayment = async () => {
    if (!selectedProvider) return;

    try {
      await initiateMobileMoneyPayment(
        orderId, 
        phoneNumber, 
        selectedProvider
      );
      
      // Commencer à surveiller le statut
      const checkStatus = async () => {
        const result = await checkMobileMoneyPaymentStatus(
          orderId, 
          selectedProvider
        );

        if (result.status === 'completed') {
          onPaymentSuccess();
        } else if (result.status === 'failed') {
          // Gérer l'échec
        }
      };

      // Vérifier toutes les 10 secondes
      const statusInterval = setInterval(checkStatus, 10000);

      // Nettoyer l'intervalle
      return () => clearInterval(statusInterval);
    } catch (error) {
      console.error('Erreur de paiement mobile', error);
    }
  };

  return (
    <Box>
      <Typography variant="h6">
        Choisissez votre opérateur Mobile Money
      </Typography>

      <Grid container spacing={2}>
        {providers.map(provider => (
          <Grid item xs={4} key={provider.code}>
            <Button
              variant="outlined"
              onClick={() => handleProviderSelect(provider.code)}
              fullWidth
            >
              <img 
                src={provider.logo} 
                alt={provider.name} 
                style={{ maxHeight: 50 }} 
              />
              {provider.name}
            </Button>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
      >
        <DialogTitle>
          Paiement Mobile Money
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Numéro de téléphone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="Ex: +225 01 23 45 67"
          />
          <Typography variant="body2">
            Montant à payer : {totalAmount} FCFA
          </Typography>
          {transaction?.ussdCode && (
            <Typography variant="body1" color="primary">
              Composez {transaction.ussdCode} sur votre téléphone
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleInitiatePayment}
            disabled={!phoneNumber || loading}
          >
            Initier le paiement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
