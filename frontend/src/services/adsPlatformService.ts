import axios from 'axios';
import { User } from '../types/User';
import { Product } from '../types/Product';
import { Order } from '../types/Order';

interface AdsAudience {
  google: { id: string };
  facebook: { id: string };
}

interface AdsCampaign {
  google: { id: string };
  facebook: { id: string };
}

class AdsPlatformService {
  private apiUrl = '/api/ads';

  async createRemarketingAudience(userData: User): Promise<AdsAudience> {
    try {
      const response = await axios.post(`${this.apiUrl}/remarketing/audience`, { 
        userData 
      });
      return response.data;
    } catch (error) {
      console.error('Erreur de création d\'audience', error);
      throw error;
    }
  }

  async createRemarketingCampaign(productData: Product): Promise<AdsCampaign> {
    try {
      const response = await axios.post(`${this.apiUrl}/remarketing/campaign`, { 
        productData 
      });
      return response.data;
    } catch (error) {
      console.error('Erreur de création de campagne', error);
      throw error;
    }
  }

  async trackConversion(order: Order): Promise<void> {
    try {
      const conversionData = {
        orderId: order._id,
        totalAmount: order.total,
        products: order.items.map(item => item.product)
      };

      await axios.post(`${this.apiUrl}/conversion/track`, { 
        conversionData 
      });
    } catch (error) {
      console.error('Erreur de suivi de conversion', error);
    }
  }

  // Pixel de suivi côté client
  initGoogleAdsTracking() {
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.REACT_APP_GOOGLE_ADS_PIXEL}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', process.env.REACT_APP_GOOGLE_ADS_PIXEL);
  }

  initFacebookPixel() {
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${process.env.REACT_APP_FACEBOOK_PIXEL}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
  }

  // Événements de suivi spécifiques
  trackPageView() {
    if (window.gtag) {
      window.gtag('event', 'page_view');
    }
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }

  trackProductView(product: Product) {
    if (window.gtag) {
      window.gtag('event', 'view_item', {
        'items': [{
          'id': product._id,
          'name': product.name,
          'category': product.category,
          'price': product.price
        }]
      });
    }
    if (window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_ids: [product._id],
        content_type: 'product'
      });
    }
  }

  trackAddToCart(product: Product, quantity: number) {
    if (window.gtag) {
      window.gtag('event', 'add_to_cart', {
        'items': [{
          'id': product._id,
          'name': product.name,
          'category': product.category,
          'quantity': quantity,
          'price': product.price
        }]
      });
    }
    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_ids: [product._id],
        content_type: 'product',
        value: product.price * quantity,
        currency: 'EUR'
      });
    }
  }
}

export default new AdsPlatformService();
