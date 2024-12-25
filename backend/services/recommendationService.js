import { Product } from '../models/Product.js.js';
import { User } from '../models/User.js.js';
import { Order } from '../models/Order.js.js';

export default class RecommendationService {
  async getPersonalizedRecommendations(userId, context = {}) {
    try {
      const user = await User.findById(userId);
      const userOrders = await Order.find({ userId }).populate('products');

      // Analyse des catégories préférées
      const categoryPreferences = this.analyzeCategoryPreferences(userOrders);

      // Requête de recommandations basée sur les préférences
      const recommendations = await Product.find({
        category: { $in: Object.keys(categoryPreferences) },
        ...(context.currentProductId ? { _id: { $ne: context.currentProductId } } : {})
      })
      .sort({ rating: -1 })
      .limit(10);

      return recommendations;
    } catch (error) {
      console.error('Erreur de recommandation personnalisée', error);
      return [];
    }
  }

  async getRelatedProducts(productId) {
    try {
      const product = await Product.findById(productId);
      
      // Produits similaires par catégorie et tags
      const relatedProducts = await Product.find({
        category: product.category,
        _id: { $ne: productId }
      })
      .limit(5);

      return relatedProducts;
    } catch (error) {
      console.error('Erreur de produits similaires', error);
      return [];
    }
  }

  async getBrowsingRecommendations(lastViewedProducts) {
    try {
      // Recommandations basées sur les derniers produits consultés
      const recommendations = await Product.find({
        _id: { $in: lastViewedProducts }
      })
      .sort({ viewCount: -1 })
      .limit(10);

      return recommendations;
    } catch (error) {
      console.error('Erreur de recommandations de navigation', error);
      return [];
    }
  }

  analyzeCategoryPreferences(orders) {
    const categoryScores = {};

    orders.forEach(order => {
      order.products.forEach(product => {
        categoryScores[product.category] = 
          (categoryScores[product.category] || 0) + 1;
      });
    });

    // Normaliser et trier les catégories
    return Object.entries(categoryScores)
      .sort(([, a], [, b]) => b - a)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
  }

  async trackProductView(productId) {
    try {
      await Product.findByIdAndUpdate(productId, {
        $inc: { viewCount: 1 }
      });
    } catch (error) {
      console.error('Erreur de tracking de vue', error);
    }
  }

  async updateUserPreferences(userId, productId) {
    try {
      const product = await Product.findById(productId);
      
      await User.findByIdAndUpdate(userId, {
        $addToSet: { 
          viewedCategories: product.category 
        }
      });
    } catch (error) {
      console.error('Erreur de mise à jour des préférences', error);
    }
  }
}

export default new RecommendationService();
