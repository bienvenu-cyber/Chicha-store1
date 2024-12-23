import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';
import { useNotification } from './useNotification';

interface MobileMoneyProvider {
  name: string;
  code: string;
  countries: string[];
  logo: string;
}

interface MobileMoneyTransaction {
  id: string;
  provider: string;
  status: 'pending' | 'initiated' | 'processing' | 'completed' | 'failed';
  amount: number;
  ussdCode?: string;
}

export const useMobileMoney = () => {
  const [providers, setProviders] = useState<MobileMoneyProvider[]>([]);
  const [transaction, setTransaction] = useState<MobileMoneyTransaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getAuthToken } = useAuth();
  const { showNotification } = useNotification();

  // Récupérer les opérateurs disponibles
  const fetchMobileMoneyProviders = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.get('/api/mobile-payments/providers', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const enrichedProviders: MobileMoneyProvider[] = response.data.providers.map(
        (provider: string) => ({
          name: provider,
          code: provider,
          countries: ['Côte d\'Ivoire', 'Sénégal', 'Bénin', 'Togo'], // À personnaliser
          logo: `/images/mobile-money/${provider}-logo.png`
        })
      );

      setProviders(enrichedProviders);
      setLoading(false);
    } catch (err) {
      setError('Impossible de récupérer les opérateurs');
      setLoading(false);
    }
  }, [getAuthToken]);

  // Initier un paiement mobile
  const initiateMobileMoneyPayment = useCallback(async (
    orderId: string, 
    phoneNumber: string, 
    provider: string
  ) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.post(
        '/api/mobile-payments/initiate', 
        { orderId, phoneNumber, provider },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newTransaction: MobileMoneyTransaction = {
        id: response.data.transaction.transactionId,
        provider,
        status: response.data.transaction.status,
        amount: response.data.transaction.amount,
        ussdCode: response.data.transaction.ussdCode
      };

      setTransaction(newTransaction);
      showNotification(
        'success', 
        `Paiement initié via ${provider}. Composez ${newTransaction.ussdCode}`
      );
      
      setLoading(false);
      return newTransaction;
    } catch (err) {
      setError('Échec de l\'initialisation du paiement');
      showNotification('error', 'Échec de l\'initialisation du paiement');
      setLoading(false);
      throw err;
    }
  }, [getAuthToken, showNotification]);

  // Vérifier le statut du paiement
  const checkMobileMoneyPaymentStatus = useCallback(async (
    orderId: string, 
    provider: string
  ) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.get('/api/mobile-payments/status', {
        params: { orderId, provider },
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedTransaction: MobileMoneyTransaction = {
        id: transaction?.id || '',
        provider,
        status: response.data.status,
        amount: transaction?.amount || 0
      };

      setTransaction(updatedTransaction);
      
      if (updatedTransaction.status === 'completed') {
        showNotification('success', 'Paiement mobile réussi');
      }
      
      setLoading(false);
      return updatedTransaction;
    } catch (err) {
      setError('Impossible de vérifier le statut du paiement');
      showNotification('error', 'Vérification du paiement échouée');
      setLoading(false);
      throw err;
    }
  }, [getAuthToken, transaction, showNotification]);

  // Réinitialiser l'état
  const resetMobileMoneyState = useCallback(() => {
    setTransaction(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    providers,
    transaction,
    loading,
    error,
    fetchMobileMoneyProviders,
    initiateMobileMoneyPayment,
    checkMobileMoneyPaymentStatus,
    resetMobileMoneyState
  };
};
