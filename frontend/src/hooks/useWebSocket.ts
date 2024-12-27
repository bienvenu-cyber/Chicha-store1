import { useState, useEffect } from 'react';
import { 
  websocketService, 
  NotificationMessage, 
  LiveChatMessage,
  ProductStockUpdate
} from '../services/websocketService';
import { useNotification } from '../contexts/NotificationContext';

export const useWebSocket = () => {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);
  const [productStockUpdates, setProductStockUpdates] = useState<ProductStockUpdate[]>([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    // Récupérer le token d'authentification
    const token = localStorage.getItem('token');
    if (token) {
      websocketService.connect(token);
    }

    // Écouteurs d'événements
    const handleNotification = (notification: NotificationMessage) => {
      setNotifications(prev => [notification, ...prev]);
      
      // Notification système
      showNotification(notification.content, 
        notification.type === 'system' ? 'info' : 
          notification.type === 'promotion' ? 'success' : 'warning'
      );
    };

    const handleChatMessage = (message: LiveChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    };

    const handleStockUpdate = (update: ProductStockUpdate) => {
      setProductStockUpdates(prev => {
        // Mettre à jour ou ajouter la mise à jour de stock
        const existingIndex = prev.findIndex(u => u.productId === update.productId);
        if (existingIndex !== -1) {
          const newUpdates = [...prev];
          newUpdates[existingIndex] = update;
          return newUpdates;
        }
        return [...prev, update];
      });

      // Notification de stock bas
      if (update.isLowStock) {
        showNotification(
          `Stock bas pour le produit ${update.productId}`, 
          'warning'
        );
      }
    };

    // Ajouter les écouteurs
    websocketService.onNotification(handleNotification);
    websocketService.onChatMessage(handleChatMessage);
    websocketService.onProductStockUpdate(handleStockUpdate);

    // Nettoyage
    return () => {
      websocketService.disconnect();
    };
  }, []);

  const sendChatMessage = (content: string) => {
    websocketService.sendChatMessage({
      senderId: localStorage.getItem('userId') || 'anonymous',
      senderName: localStorage.getItem('userName') || 'Utilisateur',
      content
    });
  };

  return {
    notifications,
    chatMessages,
    productStockUpdates,
    sendChatMessage,
    isConnected: websocketService.isConnected()
  };
};
