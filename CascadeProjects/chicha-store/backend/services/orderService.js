const { Order } = import('../models/Order');
const { Product } = import('../models/Product');
const { User } = import('../models/User');
const PaymentService = import('./paymentService');
const NotificationService = import('./notificationService');

class OrderService {
  // Création d'une commande
  async createOrder(userId, orderData) {
    try {
      // Validation des produits
      const validatedProducts = await this.validateOrderProducts(orderData.products);

      // Calcul du montotal
      const totalAmount = validatedProducts.reduce((total, product) => 
        total + (product.price * product.quantity), 0
      );

      // Création de la commande
      const order = new Order({
        userId,
        products: validatedProducts.map(product => ({
          productId: product._id,
          quantity: product.quantity,
          price: product.price
        })),
        totalAmount,
        shippingAddress: orderData.shippingAddress,
        status: 'pending'
      });

      await order.save();

      // Créer l'intention de paiement
      const paymentIntent = await PaymentService.createPaymentIntent(order);

      // Notification de commande
      await NotificationService.sendOrderConfirmation(userId, order);

      return {
        order,
        paymentIntent
      };
    } catch (error) {
      console.error('Erreur de création de commande', error);
      throw error;
    }
  }

  // Validation des produits de la commande
  async validateOrderProducts(products) {
    const validatedProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        throw new Error(`Produit introuvable: ${item.productId}`);
      }

      // Vérifier le stock
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuffisant pour ${product.name}`);
      }

      validatedProducts.push({
        ...product.toObject(),
        quantity: item.quantity
      });
    }

    return validatedProducts;
  }

  // Récupération des commandes d'un utilisateur
  async getUserOrders(userId, filters = {}) {
    try {
      const query = { 
        userId, 
        ...filters 
      };

      const orders = await Order.find(query)
        .populate('products.productId')
        .sort({ createdAt: -1 });

      return orders;
    } catch (error) {
      console.error('Erreur de récupération des commandes', error);
      throw error;
    }
  }

  // Mise à jour du statut de commande
  async updateOrderStatus(orderId, newStatus, adminId) {
    try {
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new Error('Commande non trouvée');
      }

      // Historique des changements de statut
      order.statusHistory.push({
        status: newStatus,
        updatedBy: adminId,
        updatedAt: new Date()
      });

      order.status = newStatus;
      await order.save();

      // Notification de changement de statut
      await NotificationService.sendOrderStatusUpdate(
        order.userId, 
        order, 
        newStatus
      );

      return order;
    } catch (error) {
      console.error('Erreur de mise à jour de statut', error);
      throw error;
    }
  }

  // Annulation de commande
  async cancelOrder(orderId, userId) {
    try {
      const order = await Order.findOne({ 
        _id: orderId, 
        userId 
      });

      if (!order) {
        throw new Error('Commande non trouvée');
      }

      // Vérifier si la commande peut être annulée
      if (!['pending', 'processing'].includes(order.status)) {
        throw new Error('Commande non annulable');
      }

      // Annulation et remboursement si déjà payé
      if (order.status === 'paid') {
        await PaymentService.refundOrder(orderId);
      }

      // Restaurer le stock des produits
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity }
        });
      }

      // Mettre à jour le statut
      order.status = 'cancelled';
      await order.save();

      // Notification d'annulation
      await NotificationService.sendOrderCancellation(userId, order);

      return order;
    } catch (error) {
      console.error('Erreur d\'annulation de commande', error);
      throw error;
    }
  }

  // Statistiques de commandes
  async getOrderStatistics(userId) {
    try {
      const stats = await Order.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' }
          }
        }
      ]);

      const totalOrders = await Order.countDocuments({ userId });
      const recentOrders = await Order.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('products.productId');

      return {
        statusStats: stats,
        totalOrders,
        recentOrders
      };
    } catch (error) {
      console.error('Erreur de récupération des statistiques', error);
      throw error;
    }
  }

  // Recherche avancée de commandes
  async searchOrders(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * limit;

      const query = this.buildSearchQuery(filters);

      const orders = await Order.find(query)
        .populate('userId', 'firstName lastName email')
        .populate('products.productId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Order.countDocuments(query);

      return {
        orders,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      };
    } catch (error) {
      console.error('Erreur de recherche de commandes', error);
      throw error;
    }
  }

  // Construction de requête de recherche dynamique
  buildSearchQuery(filters) {
    const query = {};

    if (filters.status) query.status = filters.status;
    if (filters.minAmount) query.totalAmount = { $gte: filters.minAmount };
    if (filters.maxAmount) query.totalAmount = { 
      ...query.totalAmount, 
      $lte: filters.maxAmount 
    };
    
    if (filters.startDate) {
      query.createdAt = { $gte: new Date(filters.startDate) };
    }
    
    if (filters.endDate) {
      query.createdAt = { 
        ...query.createdAt, 
        $lte: new Date(filters.endDate) 
      };
    }

    return query;
  }
}

export default = new OrderService();
