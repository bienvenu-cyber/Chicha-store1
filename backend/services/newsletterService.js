const Newsletter = require('../models/Newsletter');
const crypto = require('crypto');
const { sendEmail } = require('./emailService');

class NewsletterService {
  async subscribeEmail(email, source = 'website') {
    try {
      // Générer un token unique pour désabonnement
      const unsubscribeToken = crypto.randomBytes(32).toString('hex');

      const newsletter = new Newsletter({
        email,
        source,
        unsubscribeToken,
        segments: this.determineSegments()
      });

      await newsletter.save();

      // Envoyer un email de bienvenue
      await this.sendWelcomeEmail(email, unsubscribeToken);

      return newsletter;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Cet email est déjà abonné');
      }
      throw error;
    }
  }

  async unsubscribeEmail(token) {
    try {
      const newsletter = await Newsletter.findOneAndUpdate(
        { unsubscribeToken: token },
        { 
          isActive: false,
          unsubscribeToken: null 
        }
      );

      if (!newsletter) {
        throw new Error('Token invalide');
      }

      return newsletter;
    } catch (error) {
      throw error;
    }
  }

  async sendNewsletterCampaign(campaign) {
    try {
      const subscribers = await Newsletter.find({ 
        isActive: true,
        segments: { $in: campaign.targetSegments }
      });

      for (const subscriber of subscribers) {
        await sendEmail({
          to: subscriber.email,
          subject: campaign.subject,
          html: campaign.content,
          unsubscribeLink: `https://chicha-store.com/unsubscribe/${subscriber.unsubscribeToken}`
        });

        subscriber.lastEmailSent = new Date();
        await subscriber.save();
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la newsletter', error);
    }
  }

  private determineSegments() {
    // Logique de segmentation dynamique
    const segments = ['new_users'];

    // Critères de segmentation potentiels
    // À implémenter avec plus de contexte utilisateur
    return segments;
  }

  async getSubscriberStats() {
    const totalSubscribers = await Newsletter.countDocuments({ isActive: true });
    const segmentStats = await Newsletter.aggregate([
      { $match: { isActive: true } },
      { 
        $group: { 
          _id: '$segments', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    return {
      total: totalSubscribers,
      segments: segmentStats
    };
  }
}

module.exports = new NewsletterService();
