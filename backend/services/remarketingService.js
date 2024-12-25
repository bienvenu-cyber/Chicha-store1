import RemarketingCampaign from '../models/RemarketingCampaign.js.js';
import User from '../models/User.js.js';
import { sendEmail } from './emailService.js.js.js';
import { trackEvent } from './analyticsService.js.js.js';

export default class RemarketingService {
  async trackAbandonedCart(userId, cartItems) {
    try {
      // Créer une campagne de remarketing
      const campaign = await RemarketingCampaign.createFromAbandonedCart(
        userId, 
        cartItems
      );

      // Enregistrer un événement dans l'analytics
      trackEvent('abandoned_cart', {
        userId,
        itemCount: cartItems.length,
        totalValue: cartItems.reduce((sum, item) => sum + item.price, 0)
      });

      return campaign;
    } catch (error) {
      console.error('Erreur de suivi du panier abandonné', error);
      throw error;
    }
  }

  async sendAbandonedCartEmail(userId) {
    try {
      // Trouver la campagne de remarketing la plus récente
      const campaign = await RemarketingCampaign.findOne({ 
        user: userId, 
        campaignType: 'email',
        status: 'pending'
      }).populate({
        path: 'abandonedCartItems.product',
        select: 'name imageUrl price'
      });

      if (!campaign) {
        return null;
      }

      // Récupérer les informations utilisateur
      const user = await User.findById(userId);

      if (!user || !user.email) {
        return null;
      }

      // Générer l'email de relance
      const emailContent = this.generateAbandonedCartEmailContent(campaign);

      // Envoyer l'email
      await sendEmail({
        to: user.email,
        subject: 'Votre panier vous attend !',
        html: emailContent,
        trackingParameters: campaign.trackingParameters
      });

      // Marquer la campagne comme envoyée
      campaign.markAsSent();
      await campaign.save();

      return campaign;
    } catch (error) {
      console.error('Erreur d\'envoi de l\'email de remarketing', error);
      throw error;
    }
  }

  async createRetargetingAdCampaign(userId, channel) {
    try {
      const campaign = await RemarketingCampaign.findOne({ 
        user: userId, 
        channel,
        status: 'pending'
      });

      if (!campaign) {
        return null;
      }

      // Logique spécifique selon la plateforme publicitaire
      switch (channel) {
        case 'google_ads':
          await this.sendGoogleAdsCampaign(campaign);
          break;
        case 'facebook_ads':
          await this.sendFacebookAdsCampaign(campaign);
          break;
      }

      campaign.markAsSent();
      await campaign.save();

      return campaign;
    } catch (error) {
      console.error('Erreur de création de campagne publicitaire', error);
      throw error;
    }
  }

  generateAbandonedCartEmailContent(campaign) {
    const items = campaign.abandonedCartItems.map(item => `
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <img src="${item.product.imageUrl}" alt="${item.product.name}" style="width: 100px; margin-right: 10px;" />
        <div>
          <h3>${item.product.name}</h3>
          <p>Prix : ${item.product.price}€</p>
        </div>
      </div>
    `).join('');

    return `
      <html>
        <body>
          <h1>Votre panier vous attend !</h1>
          <p>Vous avez laissé des articles dans votre panier. Ne les laissez pas partir !</p>
          
          <div>
            ${items}
          </div>

          <p>
            <strong>Offre spéciale :</strong> 
            Utilisez le code RETOUR10 pour obtenir 10% de réduction 
            sur votre commande.
          </p>

          <a 
            href="https://chicha-store.com/cart?utm_source=${campaign.trackingParameters.utmSource}&utm_medium=${campaign.trackingParameters.utmMedium}&utm_campaign=${campaign.trackingParameters.utmCampaign}"
            style="display: inline-block; background-color: #ff6b6b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;"
          >
            Terminer ma commande
          </a>
        </body>
      </html>
    `;
  }

  async sendGoogleAdsCampaign(campaign) {
    // Intégration avec l'API Google Ads
    // À implémenter selon la documentation de Google Ads
  }

  async sendFacebookAdsCampaign(campaign) {
    // Intégration avec l'API Facebook Ads
    // À implémenter selon la documentation de Facebook Ads
  }
}

export default new RemarketingService();
