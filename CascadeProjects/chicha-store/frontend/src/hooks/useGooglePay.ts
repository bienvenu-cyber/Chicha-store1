import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';
import { useNotification } from './useNotification';

declare global {
  interface Window {
    google?: {
      payments?: {
        api?: any;
      }
    }
  }
}

export const useGooglePay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getAuthToken } = useAuth();
  const { showNotification } = useNotification();

  const isGooglePaySupported = useCallback(async () => {
    if (!window.google?.payments?.api) {
      return false;
    }

    try {
      const isReadyToPayRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA']
          }
        }]
      };

      const response = await window.google.payments.api.isReadyToPay(isReadyToPayRequest);
      return response.result;
    } catch (err) {
      return false;
    }
  }, []);

  const initiateGooglePayPayment = useCallback(async (
    orderId: string, 
    totalAmount: number, 
    currency = 'USD'
  ) => {
    if (!await isGooglePaySupported()) {
      showNotification('error', 'Google Pay non supporté');
      return null;
    }

    try {
      setLoading(true);
      const token = getAuthToken();

      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'example',
              gatewayMerchantId: 'chicha-store'
            }
          }
        }],
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: totalAmount.toString(),
          currencyCode: currency
        },
        merchantInfo: {
          merchantName: 'Chicha Store'
        }
      };

      const paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: 'TEST'
      });

      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);

      const response = await axios.post(
        '/api/payments/google/process', 
        { 
          orderId,
          paymentToken: paymentData.paymentMethodData,
          amount: totalAmount
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification('success', 'Paiement Google Pay réussi');
      setLoading(false);
      return response.data;
    } catch (err) {
      setError('Impossible de lancer le paiement Google Pay');
      showNotification('error', 'Échec du paiement Google Pay');
      setLoading(false);
      return null;
    }
  }, [isGooglePaySupported, getAuthToken]);

  return {
    initiateGooglePayPayment,
    isGooglePaySupported,
    loading,
    error
  };
};
