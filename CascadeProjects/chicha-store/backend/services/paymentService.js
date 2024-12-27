const stripe = import('stripe')(process.env.STRIPE_SECRET_KEY);
const { Order } = import('../models/Order');
const { Product } = import('../models/Product');
const { User } = import('../models/User');

class PaymentService {
  // Création d'un paiement Stripe
  async createPaymentIntent(order) {
    try {
      // Vérifier les produits et leurs prix
      const lineItems = await this.validateOrderItems(order.products);

      // Calcul du montant total
      const totalAmount = lineItems.reduce((total, item) => 
        total + (item.price * item.quantity), 0
      );

      // Création de l'intention de paiement
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convertir en centimes
        currency: 'eur',
        metadata: {
          orderId: order._id.toString(),
          userId: order.userId.toString()
        },
        payment_method_types: ['card', 'sepa_debit', 'ideal']
      });

      // Mettre à jour la commande avec l'ID du paiement
      order.paymentIntentId = paymentIntent.id;
      await order.save();

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Erreur de création de paiement', error);
      throw new Error('Impossible de créer le paiement');
    }
  }

  // Validation des articles de la commande
  async validateOrderItems(orderProducts) {
    const lineItems = [];

    for (const item of orderProducts) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        throw new Error(`Produit introuvable: ${item.productId}`);
      }

      // Vérifier le stock
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuffisant pour ${product.name}`);
      }

      lineItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });
    }

    return lineItems;
  }

  // Confirmation de paiement
  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        const order = await Order.findOne({ 
          paymentIntentId: paymentIntentId 
        });

        if (!order) {
          throw new Error('Commande non trouvée');
        }

        // Mettre à jour le statut de la commande
        order.status = 'paid';
        order.paidAt = new Date();

        // Mettre à jour le stock des produits
        for (const item of order.products) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity }
          });
        }

        await order.save();

        return order;
      }

      return null;
    } catch (error) {
      console.error('Erreur de confirmation de paiement', error);
      throw error;
    }
  }

  // Remboursement
  async refundOrder(orderId) {
    try {
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new Error('Commande non trouvée');
      }

      // Vérifier si le paiement peut être remboursé
      if (order.status !== 'paid') {
        throw new Error('Commande non payée');
      }

      // Créer un remboursement Stripe
      const refund = await stripe.refunds.create({
        payment_intent: order.paymentIntentId
      });

      // Mettre à jour le statut de la commande
      order.status = 'refunded';
      order.refundedAt = new Date();

      // Restaurer le stock des produits
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity }
        });
      }

      await order.save();

      return {
        order,
        refundId: refund.id
      };
    } catch (error) {
      console.error('Erreur de remboursement', error);
      throw error;
    }
  }

  // Webhook Stripe
  async handleStripeWebhook(event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await this.confirmPayment(paymentIntent.id);
        break;
      
      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object;
        // Gérer l'échec de paiement
        await this.handleFailedPayment(failedPaymentIntent);
        break;
      
      default:
        console.log(`Événement Stripe non géré : ${event.type}`);
    }
  }

  // Gestion des paiements échoués
  async handleFailedPayment(paymentIntent) {
    try {
      const order = await Order.findOne({ 
        paymentIntentId: paymentIntent.id 
      });

      if (order) {
        order.status = 'payment_failed';
        await order.save();

        // Notifier l'utilisateur
        const user = await User.findById(order.userId);
        // Envoi d'une notification par email ou autre moyen
      }
    } catch (error) {
      console.error('Erreur de gestion de paiement échoué', error);
    }
  }

  // Génération de reçu
  async generateReceipt(orderId) {
    try {
      const order = await Order.findById(orderId)
        .populate('products.productId')
        .populate('userId');

      if (!order) {
        throw new Error('Commande non trouvée');
      }

      return {
        orderNumber: order._id,
        date: order.createdAt,
        customer: {
          name: order.userId.firstName + ' ' + order.userId.lastName,
          email: order.userId.email
        },
        items: order.products.map(item => ({
          name: item.productId.name,
          quantity: item.quantity,
          unitPrice: item.productId.price,
          total: item.quantity * item.productId.price
        })),
        total: order.totalAmount,
        paymentMethod: 'Stripe',
        status: order.status
      };
    } catch (error) {
      console.error('Erreur de génération de reçu', error);
      throw error;
    }
  }
}

export default = new PaymentService();
