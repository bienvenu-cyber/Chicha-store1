const { Product } = require('../models/Product');
const { User } = require('../models/User');
const { Order } = require('../models/Order');
const logger = require('./logger');
const natural = require('natural');
const TfIdf = natural.TfIdf;
const mongoose = require('mongoose');

class RecommendationService {
  constructor() {
    this.tfidf = new TfIdf();
    this.productVectors = new Map();
    this.initializeProductVectors();
  }

  async initializeProductVectors() {
    try {
      const products = await Product.find({});
      products.forEach(product => {
        this.tfidf.addDocument(this.createProductTextVector(product));
      });

      // Create vector representations
      products.forEach((product, index) => {
        const vector = this.tfidf.listTerms(index).map(term => term.tfidf);
        this.productVectors.set(product._id.toString(), vector);
      });

      logger.info('Product recommendation vectors initialized');
    } catch (error) {
      logger.error('Error initializing product vectors', { error: error.message });
    }
  }

  createProductTextVector(product) {
    return `${product.name} ${product.description} ${product.category} ${product.tags.join(' ')}`;
  }

  calculateCosineSimilarity(vec1, vec2) {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitude1 * magnitude2);
  }

  async getPersonalizedRecommendations(userId, context = {}) {
    try {
      const user = await User.findById(userId);
      const userOrders = await Order.find({ userId }).populate('products');

      if (!user) {
        logger.warn('User not found for personalized recommendations', { userId });
        return [];
      }

      const categoryPreferences = this.analyzeCategoryPreferences(userOrders);
      const lastPurchasedProductIds = userOrders.flatMap(order => 
        order.products.map(p => p._id.toString())
      );

      // Advanced recommendation algorithm
      const recommendations = await Product.find({
        category: { $in: Object.keys(categoryPreferences) },
        _id: { $nin: lastPurchasedProductIds },
        ...(context.currentProductId ? { _id: { $ne: context.currentProductId } } : {})
      })
      .sort({ rating: -1, popularity: -1 })
      .limit(15);

      // Re-rank recommendations using semantic similarity
      const rankedRecommendations = recommendations
        .map(product => {
          const currentProductVector = this.productVectors.get(product._id.toString());
          const similarityScores = lastPurchasedProductIds.map(id => 
            this.calculateCosineSimilarity(currentProductVector, this.productVectors.get(id))
          );
          const averageSimilarity = similarityScores.reduce((a, b) => a + b, 0) / similarityScores.length;
          
          return { product, score: averageSimilarity };
        })
        .sort((a, b) => b.score - a.score)
        .map(item => item.product);

      logger.info('Generated personalized recommendations', { 
        userId, 
        recommendationCount: rankedRecommendations.length 
      });

      return rankedRecommendations;
    } catch (error) {
      logger.error('Personalized recommendation error', { 
        userId, 
        error: error.message 
      });
      return [];
    }
  }

  analyzeCategoryPreferences(orders) {
    const categoryScores = {};
    orders.forEach(order => {
      order.products.forEach(product => {
        categoryScores[product.category] = 
          (categoryScores[product.category] || 0) + order.totalAmount;
      });
    });
    return categoryScores;
  }

  async getRelatedProducts(productId, limit = 5) {
    try {
      const product = await Product.findById(productId);
      
      if (!product) {
        logger.warn('Product not found for related products', { productId });
        return [];
      }

      const productVector = this.productVectors.get(productId.toString());
      
      // Find related products using semantic similarity
      const relatedProducts = await Product.find({
        category: product.category,
        _id: { $ne: productId }
      })
      .sort({ rating: -1 })
      .limit(limit * 2);  // Fetch more to filter

      const rankedRelatedProducts = relatedProducts
        .map(relatedProduct => {
          const relatedVector = this.productVectors.get(relatedProduct._id.toString());
          const similarity = this.calculateCosineSimilarity(productVector, relatedVector);
          return { product: relatedProduct, similarity };
        })
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(item => item.product);

      logger.info('Generated related products', { 
        productId, 
        relatedProductCount: rankedRelatedProducts.length 
      });

      return rankedRelatedProducts;
    } catch (error) {
      logger.error('Related products error', { 
        productId, 
        error: error.message 
      });
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

  async getRecommendedProducts(userId, currentProductId, categoryId, limit = 4) {
    try {
      // Étape 1: Trouver les produits achetés par l'utilisateur
      const userOrders = await Order.find({ user: userId });
      const purchasedProductIds = userOrders.flatMap(order => 
        order.items.map(item => item.product)
      );

      // Étape 2: Requête de recommandation complexe
      const recommendations = await Product.aggregate([
        {
          $match: {
            $and: [
              { _id: { $ne: mongoose.Types.ObjectId(currentProductId) } },
              { category: mongoose.Types.ObjectId(categoryId) },
              { _id: { $nin: purchasedProductIds } }
            ]
          }
        },
        { $sample: { size: limit } },
        {
          $lookup: {
            from: 'reviews',
            localField: '_id',
            foreignField: 'product',
            as: 'reviews'
          }
        },
        {
          $addFields: {
            averageRating: { $avg: '$reviews.rating' }
          }
        },
        { $sort: { averageRating: -1 } }
      ]);

      return recommendations;
    } catch (error) {
      console.error('Recommendation error:', error);
      throw new Error('Failed to generate recommendations');
    }
  }

  async getGeneralRecommendations(limit = 6) {
    try {
      return await Product.aggregate([
        { $match: { isActive: true } },
        { $sample: { size: limit } },
        {
          $lookup: {
            from: 'reviews',
            localField: '_id',
            foreignField: 'product',
            as: 'reviews'
          }
        },
        {
          $addFields: {
            averageRating: { $avg: '$reviews.rating' },
            reviewCount: { $size: '$reviews' }
          }
        },
        { $sort: { averageRating: -1, reviewCount: -1 } }
      ]);
    } catch (error) {
      console.error('General recommendations error:', error);
      throw new Error('Failed to fetch general recommendations');
    }
  }
}

module.exports = new RecommendationService();
