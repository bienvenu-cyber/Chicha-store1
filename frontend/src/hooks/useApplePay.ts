import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';
import { useNotification } from './useNotification';

declare global {
  interface Window {
    ApplePaySession?: any;
  }
}

export const useApplePay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getAuthToken } = useAuth();
  const { showNotification } = useNotification();

  const isApplePaySupported = useCallback(() => {
    return 'ApplePaySession' in window && window.ApplePaySession?.canMakePayments();
  }, []);

  const initiateApplePayPayment = useCallback(async (
    orderId: string, 
    totalAmount: number, 
    currency = 'USD'
  ) => {
    if (!isApplePaySupported()) {
      showNotification('error', 'Apple Pay non supporté');
      return null;
    }

    try {
      setLoading(true);
      const token = getAuthToken();

      // Préparer la requête de paiement
      const paymentRequest = {
        countryCode: 'US',
        currencyCode: currency,
        total: {
          label: 'Chicha Store',
          amount: totalAmount.toString()
        },
        supportedNetworks: ['visa', 'mastercard', 'amex', 'discover'],
        merchantCapabilities: ['supports3DS']
      };

      const session = new window.ApplePaySession(3, paymentRequest);

      session.onvalidatemerchant = async (event: any) => {
        try {
          // Valider le marchand côté serveur
          const response = await axios.post(
            '/api/payments/apple/validate-merchant',
            { 
              validationURL: event.validationURL,
              displayName: 'Chicha Store'
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          session.completeMerchantValidation(response.data.merchantSession);
        } catch (err) {
          session.abort();
          setError('Validation du marchand échouée');
        }
      };

      session.onpaymentauthorized = async (event: any) => {
        try {
          const response = await axios.post(
            '/api/payments/apple/process', 
            { 
              orderId,
              paymentToken: event.payment.token,
              amount: totalAmount
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
          showNotification('success', 'Paiement Apple Pay réussi');
          setLoading(false);
          return response.data;
        } catch (err) {
          session.completePayment(window.ApplePaySession.STATUS_FAILURE);
          setError('Traitement du paiement Apple Pay échoué');
          showNotification('error', 'Paiement Apple Pay échoué');
          setLoading(false);
          return null;
        }
      };

      session.begin();
    } catch (err) {
      setError('Impossible de lancer le paiement Apple Pay');
      showNotification('error', 'Échec de lancement du paiement Apple Pay');
      setLoading(false);
    }
  }, [isApplePaySupported, getAuthToken]);

  return {
    initiateApplePayPayment,
    isApplePaySupported,
    loading,
    error
  };
};
