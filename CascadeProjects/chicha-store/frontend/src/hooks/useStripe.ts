import { useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { 
  Elements, 
  CardElement, 
  useStripe as useStripeHook, 
  useElements 
} from '@stripe/react-stripe-js';
import axios from 'axios';
import { useAuth } from './useAuth';
import { useNotification } from './useNotification';

interface StripePaymentProps {
  orderId: string;
  totalAmount: number;
  currency?: string;
}

export const useStripe = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const { getAuthToken } = useAuth();
  const { showNotification } = useNotification();

  const createPaymentIntent = useCallback(async (
    orderId: string, 
    totalAmount: number, 
    currency = 'usd'
  ) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await axios.post(
        '/api/payments/stripe/create-intent', 
        { 
          orderId, 
          amount: totalAmount, 
          currency 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setClientSecret(response.data.clientSecret);
      setLoading(false);
      return response.data.clientSecret;
    } catch (err) {
      setError('Impossible de créer l\'intention de paiement');
      showNotification('error', 'Échec de création du paiement Stripe');
      setLoading(false);
      throw err;
    }
  }, [getAuthToken]);

  const StripePaymentForm = ({ 
    orderId, 
    totalAmount, 
    currency = 'usd' 
  }: StripePaymentProps) => {
    const stripe = useStripeHook();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();

      if (!stripe || !elements || !clientSecret) {
        return;
      }

      setProcessing(true);

      try {
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: 'Client Chicha Store'
            }
          }
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        // Confirmer le paiement côté serveur
        const token = getAuthToken();
        await axios.post(
          '/api/payments/stripe/confirm', 
          { 
            paymentIntentId: result.paymentIntent.id,
            orderId 
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        showNotification('success', 'Paiement Stripe réussi');
        setProcessing(false);
      } catch (err) {
        setError(err.message);
        showNotification('error', 'Paiement Stripe échoué');
        setProcessing(false);
      }
    };

    return (
      <form onSubmit={handleSubmit}>
        <CardElement />
        <button 
          type="submit" 
          disabled={!stripe || processing || loading}
        >
          Payer {totalAmount} {currency.toUpperCase()}
        </button>
      </form>
    );
  };

  const StripePaymentWrapper = ({ 
    orderId, 
    totalAmount, 
    currency = 'usd' 
  }: StripePaymentProps) => {
    const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

    return (
      <Elements stripe={stripePromise}>
        <StripePaymentForm 
          orderId={orderId} 
          totalAmount={totalAmount} 
          currency={currency} 
        />
      </Elements>
    );
  };

  return {
    createPaymentIntent,
    StripePaymentWrapper,
    loading,
    error,
    clientSecret
  };
};
