const nodemailer = import('nodemailer');
const { Notification } = import('../models/Notification');
const { User } = import('../models/User');

class NotificationService {
  constructor() {
    // Configuration du transporteur email
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Envoi de notification par email
  async sendEmail(to, subject, template) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html: template
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Erreur d\'envoi d\'email', error);
    }
  }

  // Confirmation de commande
  async sendOrderConfirmation(userId, order) {
    try {
      const user = await User.findById(userId);

      // Email de confirmation
      const emailTemplate = this.createOrderConfirmationTemplate(order);
      await this.sendEmail(
        user.email, 
        'Confirmation de votre commande', 
        emailTemplate
      );

      // Notification en base
      await this.createNotification(
        userId, 
        'order_confirmation', 
        `Votre commande #${order._id} a été confirmée`
      );
    } catch (error) {
      console.error('Erreur de confirmation de commande', error);
    }
  }

  // Mise à jour du statut de commande
  async sendOrderStatusUpdate(userId, order, newStatus) {
    try {
      const user = await User.findById(userId);

      // Email de mise à jour
      const emailTemplate = this.createOrderStatusUpdateTemplate(order, newStatus);
      await this.sendEmail(
        user.email, 
        `Mise à jour de votre commande #${order._id}`, 
        emailTemplate
      );

      // Notification en base
      await this.createNotification(
        userId, 
        'order_status_update', 
        `Votre commande #${order._id} est maintenant ${newStatus}`
      );
    } catch (error) {
      console.error('Erreur de mise à jour de statut', error);
    }
  }

  // Annulation de commande
  async sendOrderCancellation(userId, order) {
    try {
      const user = await User.findById(userId);

      // Email d'annulation
      const emailTemplate = this.createOrderCancellationTemplate(order);
      await this.sendEmail(
        user.email, 
        `Annulation de votre commande #${order._id}`, 
        emailTemplate
      );

      // Notification en base
      await this.createNotification(
        userId, 
        'order_cancellation', 
        `Votre commande #${order._id} a été annulée`
      );
    } catch (error) {
      console.error('Erreur d\'annulation de commande', error);
    }
  }

  // Création de notification en base
  async createNotification(userId, type, message) {
    try {
      const notification = new Notification({
        userId,
        type,
        message,
        isRead: false
      });

      await notification.save();
    } catch (error) {
      console.error('Erreur de création de notification', error);
    }
  }

  // Récupération des notifications
  async getUserNotifications(userId, filters = {}) {
    try {
      const query = { 
        userId, 
        ...filters 
      };

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(50);

      return notifications;
    } catch (error) {
      console.error('Erreur de récupération des notifications', error);
      throw error;
    }
  }

  // Marquer les notifications comme lues
  async markNotificationsAsRead(userId, notificationIds) {
    try {
      await Notification.updateMany(
        { 
          _id: { $in: notificationIds },
          userId 
        },
        { isRead: true }
      );
    } catch (error) {
      console.error('Erreur de marquage des notifications', error);
      throw error;
    }
  }

  // Templates d'email
  createOrderConfirmationTemplate(order) {
    return `
      <h1>Confirmation de commande</h1>
      <p>Merci pour votre commande #${order._id}</p>
      <p>Montant total : ${order.totalAmount} €</p>
      <!-- Plus de détails -->
    `;
  }

  createOrderStatusUpdateTemplate(order, newStatus) {
    return `
      <h1>Mise à jour de commande</h1>
      <p>Votre commande #${order._id} est maintenant ${newStatus}</p>
      <!-- Plus de détails -->
    `;
  }

  createOrderCancellationTemplate(order) {
    return `
      <h1>Annulation de commande</h1>
      <p>Votre commande #${order._id} a été annulée</p>
      <!-- Plus de détails -->
    `;
  }
}

export default = new NotificationService();
