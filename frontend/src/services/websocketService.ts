import { io, Socket } from 'socket.io-client';

export interface NotificationMessage {
  id: string;
  type: 'order' | 'promotion' | 'support' | 'system';
  title: string;
  content: string;
  timestamp: number;
  priority?: 'low' | 'medium' | 'high';
}

export interface LiveChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
}

export interface ProductStockUpdate {
  productId: string;
  currentStock: number;
  isLowStock: boolean;
}

class WebSocketService {
  private socket: Socket | null = null;
  private static instance: WebSocketService;

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(token: string) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io('http://localhost:5000', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Notifications en temps réel
  onNotification(callback: (notification: NotificationMessage) => void) {
    this.socket?.on('notification', callback);
  }

  // Mises à jour de stock
  onProductStockUpdate(callback: (update: ProductStockUpdate) => void) {
    this.socket?.on('product_stock_update', callback);
  }

  // Chat en direct
  sendChatMessage(message: Omit<LiveChatMessage, 'id' | 'timestamp'>) {
    this.socket?.emit('send_chat_message', message);
  }

  onChatMessage(callback: (message: LiveChatMessage) => void) {
    this.socket?.on('chat_message', callback);
  }

  // Événements de commande
  onOrderStatusUpdate(callback: (orderUpdate: { 
    orderId: string, 
    status: string 
  }) => void) {
    this.socket?.on('order_status_update', callback);
  }

  // Promotions en temps réel
  onPromotion(callback: (promotion: { 
    id: string, 
    description: string, 
    discount: number 
  }) => void) {
    this.socket?.on('promotion', callback);
  }

  // Méthode utilitaire pour vérifier la connexion
  isConnected(): boolean {
    return !!this.socket?.connected;
  }
}

export const websocketService = WebSocketService.getInstance();
