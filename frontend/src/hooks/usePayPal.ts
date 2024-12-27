import { useState, useCallback } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useDispatch } from 'react-redux';
import { clearCart } from '../redux/cartSlice';

// Types pour la configuration PayPal
interface PayPalConfig {
  clientId: string;
  currency: string;
  intent: 'capture' | 'authorize';
}

// Types pour les détails de la commande
interface OrderDetails {
  total: number;
  description: string;
  items: Array<{
    name: string;
    quantity: number;
    unit_amount: {
      currency_code: string;
      value: string;
    };
  }>;
}

// Types pour les actions de paiement
interface PaymentActions {
  createOrder: (data: any, actions: any) => Promise<string>;
  onApprove: (data: any, actions: any) => Promise<void>;
  onError: (error: Error) => void;
}

export const usePayPal = (config: PayPalConfig) => {
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);

  // Création de la commande PayPal
  const createOrder = useCallback(async (orderDetails: OrderDetails) => {
    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderDetails),
      });

      if (!response.ok) {
        throw new Error('Impossible de créer la commande PayPal');
      }

      const orderData = await response.json();
      return orderData.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de paiement';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Gestion de l'approbation du paiement
  const onApprove = useCallback(async (data: { orderID: string }) => {
    try {
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderID: data.orderID }),
      });

      if (!response.ok) {
        throw new Error('Échec de la capture du paiement');
      }

      const captureData = await response.json();
      
      // Réinitialisation du panier après paiement réussi
      dispatch(clearCart());

      return captureData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de paiement';
      setError(errorMessage);
      throw err;
    }
  }, [dispatch]);

  // Gestion des erreurs de paiement
  const handlePayPalError = useCallback((error: Error) => {
    console.error('Erreur PayPal:', error);
    setError(error.message);
  }, []);

  // Composant PayPal réutilisable
  const PayPalButtonWrapper: React.FC<{ 
    orderDetails: OrderDetails 
  }> = ({ orderDetails }) => {
    return (
      <PayPalScriptProvider options={{ 
        clientId: config.clientId,
        currency: config.currency,
        intent: config.intent
      }}>
        <PayPalButtons
          createOrder={() => createOrder(orderDetails)}
          onApprove={(data) => onApprove(data)}
          onError={handlePayPalError}
          style={{
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal'
          }}
        />
      </PayPalScriptProvider>
    );
  };

  return {
    PayPalButtonWrapper,
    error,
    createOrder,
    onApprove
  };
};

// Exemple d'utilisation
export const PayPalPayment: React.FC = () => {
  const paypalConfig: PayPalConfig = {
    clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || '',
    currency: 'USD',
    intent: 'capture'
  };

  const orderDetails: OrderDetails = {
    total: 100.00,
    description: 'Achat sur Chicha Store',
    items: [
      {
        name: 'Produit',
        quantity: 1,
        unit_amount: {
          currency_code: 'USD',
          value: '100.00'
        }
      }
    ]
  };

  const { PayPalButtonWrapper, error } = usePayPal(paypalConfig);

  return (
    <div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <PayPalButtonWrapper orderDetails={orderDetails} />
    </div>
  );
};
