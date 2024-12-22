import { useState, useCallback } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from 'axios';
import { useAuth } from './useAuth';
import { useNotification } from './useNotification';

interface PayPalPaymentOptions {
  clientId: string;
  currency?: string;
  intent?: 'capture' | 'authorize';
}

export const usePayPal = (orderId: string, totalAmount: number) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);

  const { getAuthToken } = useAuth();
  const { showNotification } = useNotification();

  const createPayPalOrder = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await axios.post(
        '/api/payments/paypal/create-order', 
        { 
          orderId, 
          amount: totalAmount 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPaypalOrderId(response.data.id);
      setLoading(false);
      return response.data.id;
    } catch (err) {
      setError('Impossible de créer la commande PayPal');
      showNotification('error', 'Échec de création de la commande PayPal');
      setLoading(false);
      throw err;
    }
  }, [orderId, totalAmount, getAuthToken]);

  const onApprove = useCallback(async (data: any) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await axios.post(
        '/api/payments/paypal/capture-order', 
        { 
          orderID: data.orderID,
          orderId 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification('success', 'Paiement PayPal réussi');
      setLoading(false);
      return response.data;
    } catch (err) {
      setError('Impossible de capturer le paiement PayPal');
      showNotification('error', 'Capture du paiement PayPal échouée');
      setLoading(false);
      throw err;
    }
  }, [orderId, getAuthToken]);

  const PayPalButtonWrapper = useCallback(
    (options: PayPalPaymentOptions) => (
      <PayPalScriptProvider options={options}>
        <PayPalButtons
          createOrder={createPayPalOrder}
          onApprove={onApprove}
          onError={(err) => {
            setError(err.message);
            showNotification('error', 'Erreur de paiement PayPal');
          }}
        />
      </PayPalScriptProvider>
    ),
    [createPayPalOrder, onApprove]
  );

  return {
    PayPalButtonWrapper,
    loading,
    error,
    paypalOrderId
  };
};
