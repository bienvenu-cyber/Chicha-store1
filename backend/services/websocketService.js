import socketIo from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js.js';
import { Product } from '../models/Product.js.js';

export default class WebSocketService {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('New WebSocket connection', socket.user.id);

      // Notifications en temps réel
      this.handleNotifications(socket);

      // Mises à jour de stock
      this.handleStockUpdates(socket);

      // Chat en direct
      this.handleChatMessages(socket);

      // Événements de commande
      this.handleOrderUpdates(socket);

      // Promotions
      this.handlePromotions(socket);
    });
  }

  handleNotifications(socket) {
    // Logique de notification personnalisée
    socket.on('request_notifications', async () => {
      try {
        // Récupérer les notifications pour l'utilisateur
        const notifications = await this.getUserNotifications(socket.user.id);
        socket.emit('notifications', notifications);
      } catch (error) {
        console.error('Erreur de récupération des notifications', error);
      }
    });
  }

  handleStockUpdates(socket) {
    // Surveillance des stocks de produits
    socket.on('monitor_product_stock', async (productId) => {
      try {
        const product = await Product.findById(productId);
        if (product.stock < 10) {
          socket.emit('product_stock_update', {
            productId,
            currentStock: product.stock,
            isLowStock: true
          });
        }
      } catch (error) {
        console.error('Erreur de surveillance de stock', error);
      }
    });
  }

  handleChatMessages(socket) {
    socket.on('send_chat_message', async (message) => {
      try {
        // Enregistrer le message
        const savedMessage = await this.saveChatMessage(
          socket.user.id, 
          message.content
        );

        // Diffuser le message
        this.io.emit('chat_message', {
          id: savedMessage._id,
          senderId: socket.user.id,
          senderName: socket.user.name,
          content: message.content,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Erreur d\'envoi de message', error);
      }
    });
  }

  handleOrderUpdates(socket) {
    socket.on('track_order', async (orderId) => {
      try {
        const order = await Order.findById(orderId);
        
        // Mise à jour en temps réel du statut de commande
        socket.emit('order_status_update', {
          orderId,
          status: order.status
        });
      } catch (error) {
        console.error('Erreur de suivi de commande', error);
      }
    });
  }

  handlePromotions(socket) {
    // Diffuser les promotions en temps réel
    socket.on('request_promotions', async () => {
      try {
        const activePromotions = await Promotion.find({ 
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() }
        });

        socket.emit('promotions', activePromotions);
      } catch (error) {
        console.error('Erreur de récupération des promotions', error);
      }
    });
  }

  async getUserNotifications(userId) {
    // Logique de récupération des notifications
    return await Notification.find({ 
      userId, 
      isRead: false 
    }).sort({ createdAt: -1 }).limit(10);
  }

  async saveChatMessage(senderId, content) {
    const message = new ChatMessage({
      senderId,
      content,
      timestamp: Date.now()
    });
    return await message.save();
  }

  broadcastSystemNotification(message) {
    this.io.emit('notification', {
      type: 'system',
      message,
      timestamp: Date.now()
    });
  }
}

export default WebSocketService;
