import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';
import { useNotification } from './useNotification';

export const useSepaDebit = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sepaTransaction, setSepaTransaction] = useState<any>(null);

  const { getAuthToken } = useAuth();
  const { showNotification } = useNotification();

  const validateIBAN = (iban: string): boolean => {
    // Regex de validation IBAN
    const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{4,}$/;
    return ibanRegex.test(iban.replace(/\s/g, ''));
  };

  const initiateSepaDebitPayment = useCallback(async (
    orderId: string, 
    iban: string, 
    accountHolderName: string,
    amount: number,
    currency: string = 'EUR',
    bic?: string
  ) => {
    // Validation de base
    if (!validateIBAN(iban)) {
      setError('IBAN invalide');
      showNotification('error', 'IBAN invalide');
      return null;
    }

    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await axios.post(
        '/api/payments/sepa/initiate', 
        { 
          orderId, 
          iban, 
          accountHolderName,
          amount,
          currency,
          bic
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSepaTransaction(response.data);
      showNotification('info', 'Paiement SEPA initié. Mandat en cours de génération.');
      setLoading(false);
      return response.data;
    } catch (err) {
      setError('Impossible d\'initier le paiement SEPA');
      showNotification('error', 'Échec de l\'initialisation du paiement SEPA');
      setLoading(false);
      return null;
    }
  }, [getAuthToken]);

  const checkSepaPaymentStatus = useCallback(async (
    sepaPaymentId: string
  ) => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await axios.get(
        `/api/payments/sepa/status/${sepaPaymentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSepaTransaction(response.data);

      switch (response.data.status) {
      case 'completed':
        showNotification('success', 'Paiement SEPA confirmé');
        break;
      case 'failed':
        showNotification('error', 'Paiement SEPA échoué');
        break;
      default:
        showNotification('info', 'Statut du paiement SEPA en attente');
      }

      setLoading(false);
      return response.data;
    } catch (err) {
      setError('Impossible de vérifier le statut du paiement SEPA');
      showNotification('error', 'Vérification du paiement SEPA échouée');
      setLoading(false);
      return null;
    }
  }, [getAuthToken]);

  return {
    initiateSepaDebitPayment,
    checkSepaPaymentStatus,
    validateIBAN,
    sepaTransaction,
    loading,
    error
  };
};
