import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';
import { useNotification } from './useNotification';

export const useCryptoPay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cryptoCharge, setCryptoCharge] = useState<any>(null);

  const { getAuthToken } = useAuth();
  const { showNotification } = useNotification();

  const supportedCryptocurrencies = [
    'BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'XRP', 'ADA'
  ];

  const createCryptoCharge = useCallback(async (
    orderId: string, 
    amount: number, 
    cryptocurrency: string = 'USDT',
    fiatCurrency: string = 'USD'
  ) => {
    if (!supportedCryptocurrencies.includes(cryptocurrency)) {
      setError(`Cryptocurrency ${cryptocurrency} non supportée`);
      showNotification('error', `Cryptocurrency ${cryptocurrency} non supportée`);
      return null;
    }

    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await axios.post(
        '/api/payments/crypto/create-charge', 
        { 
          orderId, 
          amount, 
          cryptocurrency,
          fiatCurrency
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCryptoCharge(response.data);
      showNotification('info', 'Charge crypto créée. Veuillez confirmer le paiement.');
      setLoading(false);
      return response.data;
    } catch (err) {
      setError('Impossible de créer la charge crypto');
      showNotification('error', 'Échec de création de la charge crypto');
      setLoading(false);
      return null;
    }
  }, [getAuthToken]);

  const checkCryptoPaymentStatus = useCallback(async (
    cryptoChargeId: string
  ) => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await axios.get(
        `/api/payments/crypto/status/${cryptoChargeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCryptoCharge(response.data);

      switch (response.data.status) {
      case 'completed':
        showNotification('success', 'Paiement crypto confirmé');
        break;
      case 'failed':
        showNotification('error', 'Paiement crypto échoué');
        break;
      default:
        showNotification('info', 'Statut du paiement crypto en attente');
      }

      setLoading(false);
      return response.data;
    } catch (err) {
      setError('Impossible de vérifier le statut du paiement crypto');
      showNotification('error', 'Vérification du paiement crypto échouée');
      setLoading(false);
      return null;
    }
  }, [getAuthToken]);

  return {
    createCryptoCharge,
    checkCryptoPaymentStatus,
    supportedCryptocurrencies,
    cryptoCharge,
    loading,
    error
  };
};
