import { trackEvent } from './analyticsService';

interface AbandonedCartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
}

class RemarketingService {
  private abandonedCartItems: AbandonedCartItem[] = [];

  trackAbandonedCart(cartItems: AbandonedCartItem[]) {
    this.abandonedCartItems = cartItems;
    
    // Enregistrer l'événement dans l'analytics
    trackEvent('abandoned_cart', {
      itemCount: cartItems.length,
      totalValue: cartItems.reduce((sum, item) => sum + item.price, 0)
    });
  }

  generateRemarketingEmail(userEmail: string) {
    const emailTemplate = {
      subject: 'Votre panier vous attend !',
      body: `
        <html>
          <body>
            <h1>Vous avez laissé des articles dans votre panier</h1>
            <p>Ces produits vous attendent :</p>
            <div>
              ${this.abandonedCartItems.map(item => `
                <div>
                  <img src="${item.imageUrl}" alt="${item.name}" width="100" />
                  <h3>${item.name}</h3>
                  <p>Prix : ${item.price}€</p>
                </div>
              `).join('')}
            </div>
            <a href="/cart">Terminer ma commande</a>
            <p>Offre spéciale : -10% avec le code RETOUR10</p>
          </body>
        </html>
      `
    };

    // Envoyer l'email via un service backend
    this.sendRemarketingEmail(userEmail, emailTemplate);
  }

  private async sendRemarketingEmail(email: string, template: any) {
    try {
      await fetch('/api/marketing/remarketing-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          template
        })
      });
    } catch (error) {
      console.error('Erreur d\'envoi de l\'email de remarketing', error);
    }
  }

  createRetargetingAds(userId: string) {
    // Logique de génération de publicités de remarketing
    const adTargetingData = {
      userId,
      products: this.abandonedCartItems.map(item => item.productId),
      timestamp: new Date().toISOString()
    };

    // Envoyer aux plateformes publicitaires (Google Ads, Facebook Ads)
    this.sendRetargetingData(adTargetingData);
  }

  private async sendRetargetingData(data: any) {
    try {
      await Promise.all([
        this.sendToGoogleAds(data),
        this.sendToFacebookAds(data)
      ]);
    } catch (error) {
      console.error('Erreur de remarketing publicitaire', error);
    }
  }

  private async sendToGoogleAds(data: any) {
    // Implémentation spécifique à Google Ads
    await fetch('/api/ads/google-remarketing', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  private async sendToFacebookAds(data: any) {
    // Implémentation spécifique à Facebook Ads
    await fetch('/api/ads/facebook-remarketing', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export default new RemarketingService();
