import Subscription from '../models/Subscription.js.js';
import Product from '../models/Product.js.js';
import User from '../models/User.js.js';
import Stripe from 'stripe';
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

export default class SubscriptionService {
  async createSubscription(userId, subscriptionData) {
    try {
      // Vérifier le produit
      const product = await Product.findById(subscriptionData.product);
      if (!product) {
        throw new Error('Produit non trouvé');
      }

      // Créer un abonnement Stripe
      const stripeSubscription = await stripe.subscriptions.create({
        customer: userId,
        items: [{
          price: product.stripePriceId
        }],
        metadata: {
          userId: userId,
          productId: product._id
        }
      });

      // Créer l'abonnement dans notre base de données
      const subscription = new Subscription({
        user: userId,
        product: product._id,
        frequency: subscriptionData.frequency,
        paymentMethod: stripeSubscription.id,
        discount: this.calculateDiscount(subscriptionData.frequency)
      });

      await subscription.save();
      return subscription;
    } catch (error) {
      throw new Error(`Erreur de création d'abonnement : ${error.message}`);
    }
  }

  calculateDiscount(frequency) {
    switch(frequency) {
      case 'Trimestriel': return 10;
      case 'Semestriel': return 20;
      default: return 0;
    }
  }

  async getUserSubscriptions(userId) {
    try {
      const subscriptions = await Subscription.find({ 
        user: userId, 
        status: 'Actif' 
      })
      .populate('product')
      .sort({ nextDeliveryDate: 1 });

      return subscriptions;
    } catch (error) {
      throw new Error(`Erreur de récupération des abonnements : ${error.message}`);
    }
  }

  async cancelSubscription(subscriptionId, userId) {
    try {
      const subscription = await Subscription.findOne({ 
        _id: subscriptionId, 
        user: userId 
      });

      if (!subscription) {
        throw new Error('Abonnement non trouvé');
      }

      // Annuler l'abonnement Stripe
      await stripe.subscriptions.del(subscription.paymentMethod);

      // Mettre à jour le statut
      subscription.status = 'Annulé';
      await subscription.save();

      return subscription;
    } catch (error) {
      throw new Error(`Erreur d'annulation d'abonnement : ${error.message}`);
    }
  }

  // Tâche planifiée pour gérer les abonnements
  async processRecurringSubscriptions() {
    const today = new Date();
    
    const subscriptionsToProcess = await Subscription.find({
      nextDeliveryDate: { $lte: today },
      status: 'Actif'
    }).populate('product user');

    for (const subscription of subscriptionsToProcess) {
      try {
        // Créer une nouvelle commande
        await this.createSubscriptionOrder(subscription);

        // Mettre à jour la prochaine date de livraison
        subscription.save();
      } catch (error) {
        console.error(`Erreur de traitement d'abonnement : ${error.message}`);
      }
    }
  }

  async createSubscriptionOrder(subscription) {
    // Logique de création de commande basée sur l'abonnement
    // Peut inclure la création d'une commande, le paiement, etc.
  }
}

export default new SubscriptionService();
