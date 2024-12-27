import React, { useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useDispatch } from 'react-redux';
import { clearCart } from '../redux/cartSlice';

// Types pour la configuration Stripe
interface StripeConfig {
  publishableKey: string;
  currency: string;
}

// Types pour les détails de paiement
interface PaymentDetails {
  amount: number;
  description: string;
  customerEmail?: string;
}

// Types pour les options de carte de paiement
interface CardOptions {
  style?: {
    base?: {
      fontSize?: string;
      color?: string;
      fontFamily?: string;
    };
    invalid?: {
      color?: string;
    };
  };
}

export const useStripePayment = (config: StripeConfig) => {
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Initialisation de Stripe
  const stripePromise = loadStripe(config.publishableKey);

  // Création du paiement côté serveur
  const createPaymentIntent = useCallback(async (paymentDetails: PaymentDetails) => {
    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: paymentDetails.amount,
          currency: config.currency,
          description: paymentDetails.description,
          customerEmail: paymentDetails.customerEmail
        }),
      });

      if (!response.ok) {
        throw new Error('Impossible de créer l\'intention de paiement');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de paiement';
      setError(errorMessage);
      throw err;
    }
  }, [config]);

  // Composant de formulaire de paiement Stripe
  const StripePaymentForm: React.FC<{ 
    paymentDetails: PaymentDetails,
    cardOptions?: CardOptions 
  }> = ({ paymentDetails, cardOptions }) => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      
      if (!stripe || !elements) {
        return;
      }

      setProcessing(true);

      try {
        // Créer l'intention de paiement
        const { clientSecret } = await createPaymentIntent(paymentDetails);

        // Confirmer le paiement
        const cardElement = elements.getElement(CardElement);
        
        if (!cardElement) {
          throw new Error('Élément de carte non trouvé');
        }

        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: paymentDetails.customerEmail
            }
          }
        });

        if (result.error) {
          throw new Error(result.error.message || 'Paiement échoué');
        }

        // Paiement réussi
        dispatch(clearCart());
        setProcessing(false);
        
        return result.paymentIntent;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur de paiement';
        setError(errorMessage);
        setProcessing(false);
        throw err;
      }
    };

    return (
      <form onSubmit={handleSubmit}>
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                fontFamily: 'Arial, sans-serif',
              },
              invalid: {
                color: '#9e2146',
              },
            },
            ...cardOptions?.style,
          }}
        />
        <button type="submit" disabled={!stripe || processing}>
          {processing ? 'Traitement...' : `Payer ${paymentDetails.amount} ${config.currency}`}
        </button>
      </form>
    );
  };

  // Composant wrapper Stripe
  const StripePaymentWrapper: React.FC<{ 
    paymentDetails: PaymentDetails,
    cardOptions?: CardOptions 
  }> = ({ paymentDetails, cardOptions }) => {
    return (
      <Elements stripe={stripePromise}>
        <StripePaymentForm 
          paymentDetails={paymentDetails} 
          cardOptions={cardOptions} 
        />
      </Elements>
    );
  };

  return {
    StripePaymentWrapper,
    error,
    processing
  };
};

// Exemple d'utilisation
export const StripePayment: React.FC = () => {
  const stripeConfig: StripeConfig = {
    publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '',
    currency: 'USD'
  };

  const paymentDetails: PaymentDetails = {
    amount: 100.00,
    description: 'Achat sur Chicha Store',
    customerEmail: 'client@example.com'
  };

  const { StripePaymentWrapper, error, processing } = useStripePayment(stripeConfig);

  return (
    <div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {processing && <div>Traitement du paiement...</div>}
      <StripePaymentWrapper 
        paymentDetails={paymentDetails} 
        cardOptions={{
          style: {
            base: {
              color: '#32325d',
              fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            }
          }
        }} 
      />
    </div>
  );
};
