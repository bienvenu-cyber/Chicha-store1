import Promotion from '../models/Promotion.js.js';
import moment from 'moment';

export default class PromotionService {
  async validateCoupon(couponCode, totalAmount) {
    try {
      const promotion = await Promotion.findOne({ 
        code: couponCode,
        isActive: true 
      });

      if (!promotion) {
        return { 
          isValid: false, 
          message: 'Code promo invalide' 
        };
      }

      // Vérifier la date d'expiration
      if (moment().isAfter(promotion.expirationDate)) {
        return { 
          isValid: false, 
          message: 'Code promo expiré' 
        };
      }

      // Vérifier le montant minimum
      if (totalAmount < promotion.minimumPurchaseAmount) {
        return { 
          isValid: false, 
          message: `Montant minimum requis : ${promotion.minimumPurchaseAmount}€` 
        };
      }

      // Vérifier le nombre d'utilisations
      if (promotion.usageLimit && promotion.currentUsage >= promotion.usageLimit) {
        return { 
          isValid: false, 
          message: 'Code promo épuisé' 
        };
      }

      // Mettre à jour le nombre d'utilisations
      promotion.currentUsage += 1;
      await promotion.save();

      return {
        isValid: true,
        discountPercentage: promotion.discountPercentage,
        discountAmount: totalAmount * (promotion.discountPercentage / 100),
        message: 'Code promo appliqué avec succès'
      };
    } catch (error) {
      console.error('Erreur de validation du coupon', error);
      throw error;
    }
  }

  async getActiveCoupons() {
    try {
      return await Promotion.find({
        isActive: true,
        expirationDate: { $gte: new Date() }
      }).select('code discountPercentage description');
    } catch (error) {
      console.error('Erreur de récupération des coupons', error);
      throw error;
    }
  }

  async createPromotion(promotionData) {
    try {
      const promotion = new Promotion({
        ...promotionData,
        createdAt: new Date(),
        currentUsage: 0
      });

      await promotion.save();
      return promotion;
    } catch (error) {
      console.error('Erreur de création de promotion', error);
      throw error;
    }
  }
}

export default new PromotionService();
