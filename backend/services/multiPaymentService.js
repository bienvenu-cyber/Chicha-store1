import Stripe from 'stripe';
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
import paypal from 'paypal-rest-sdk';
import coinbase from 'coinbase-commerce-node';
import { Order } from '../models/Order.js.js';
import { User } from '../models/User.js.js';

// Configuration PayPal
paypal.configure({
  'mode': process.env.PAYPAL_MODE, // sandbox or live
  'client_id': process.env.PAYPAL_CLIENT_ID,
  'client_secret': process.env.PAYPAL_CLIENT_SECRET
});

// Configuration Coinbase
const Client = coinbase.Client;
const Charge = coinbase.resources.Charge;
Client.init(process.env.COINBASE_API_KEY);

export default class MultiPaymentService {
  constructor() {
    this.supportedMethods = [
      'credit_card',
      'paypal',
      'apple_pay',
      'google_pay',
      'sepa_debit',
      'crypto'
    ];
  }

  // Méthode générique de création de paiement
  async createPayment(order, method) {
    switch(method) {
      case 'credit_card':
        return this.createStripePayment(order);
      case 'paypal':
        return this.createPayPalPayment(order);
      case 'crypto':
        return this.createCryptoPayment(order);
      case 'apple_pay':
        return this.createApplePayPayment(order);
      case 'google_pay':
        return this.createGooglePayPayment(order);
      case 'sepa_debit':
        return this.createSEPAPayment(order);
      default:
        throw new Error('Méthode de paiement non supportée');
    }
  }

  // Paiement Stripe
  async createStripePayment(order) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'eur',
      payment_method_types: ['card'],
      metadata: { orderId: order._id.toString() }
    });

    return {
      provider: 'stripe',
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  }

  // Paiement PayPal
  async createPayPalPayment(order) {
    const paymentData = {
      "intent": "sale",
      "payer": { "payment_method": "paypal" },
      "transactions": [{
        "amount": {
          "total": order.totalAmount.toFixed(2),
          "currency": "EUR"
        },
        "description": `Commande #${order._id}`
      }],
      "redirect_urls": {
        "return_url": `${process.env.FRONTEND_URL}/payment/success`,
        "cancel_url": `${process.env.FRONTEND_URL}/payment/cancel`
      }
    };

    return new Promise((resolve, reject) => {
      paypal.payment.create(paymentData, (error, payment) => {
        if (error) reject(error);
        else {
          const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
          resolve({
            provider: 'paypal',
            paymentId: payment.id,
            approvalUrl: approvalUrl.href
          });
        }
      });
    });
  }

  // Paiement Crypto via Coinbase
  async createCryptoPayment(order) {
    const chargeData = {
      name: `Commande #${order._id}`,
      description: 'Achat sur Chicha Store',
      pricing_type: 'fixed_price',
      local_price: {
        amount: order.totalAmount.toFixed(2),
        currency: 'EUR'
      },
      metadata: {
        orderId: order._id.toString()
      }
    };

    const charge = await Charge.create(chargeData);

    return {
      provider: 'coinbase',
      chargeId: charge.id,
      hostedUrl: charge.hosted_url
    };
  }

  // Apple Pay via Stripe
  async createApplePayPayment(order) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'eur',
      payment_method_types: ['apple_pay'],
      metadata: { orderId: order._id.toString() }
    });

    return {
      provider: 'apple_pay',
      clientSecret: paymentIntent.client_secret
    };
  }

  // Google Pay via Stripe
  async createGooglePayPayment(order) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'eur',
      payment_method_types: ['google_pay'],
      metadata: { orderId: order._id.toString() }
    });

    return {
      provider: 'google_pay',
      clientSecret: paymentIntent.client_secret
    };
  }

  // Paiement SEPA
  async createSEPAPayment(order) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'eur',
      payment_method_types: ['sepa_debit'],
      metadata: { orderId: order._id.toString() }
    });

    return {
      provider: 'sepa_debit',
      clientSecret: paymentIntent.client_secret
    };
  }

  // Vérification et confirmation de paiement
  async confirmPayment(paymentData) {
    switch(paymentData.provider) {
      case 'stripe':
        return this.confirmStripePayment(paymentData);
      case 'paypal':
        return this.confirmPayPalPayment(paymentData);
      case 'crypto':
        return this.confirmCryptoPayment(paymentData);
      default:
        throw new Error('Confirmation non supportée');
    }
  }

  async confirmStripePayment(paymentData) {
    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentData.paymentIntentId
    );

    if (paymentIntent.status === 'succeeded') {
      const order = await Order.findById(paymentIntent.metadata.orderId);
      order.status = 'paid';
      await order.save();
      return order;
    }
  }

  // Méthodes similaires pour PayPal et Crypto...

  // Liste des méthodes de paiement disponibles
  getAvailablePaymentMethods() {
    return this.supportedMethods;
  }
}

export default new MultiPaymentService();
