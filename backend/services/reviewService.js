const Review = require('../models/Review');
const Product = require('../models/Product');

class ReviewService {
  async createReview(reviewData) {
    try {
      // Vérifier si l'utilisateur a déjà laissé un avis pour ce produit
      const existingReview = await Review.findOne({
        product: reviewData.product,
        user: reviewData.user
      });

      if (existingReview) {
        throw new Error('Vous avez déjà laissé un avis pour ce produit');
      }

      // Créer le nouvel avis
      const review = new Review(reviewData);
      await review.save();

      // Mettre à jour les statistiques du produit
      await this.updateProductReviewStats(reviewData.product);

      return review;
    } catch (error) {
      console.error('Erreur lors de la création de l\'avis', error);
      throw error;
    }
  }

  async getProductReviews(productId, page = 1, limit = 10) {
    try {
      const reviews = await Review.find({ product: productId })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Review.countDocuments({ product: productId });

      return {
        reviews,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des avis', error);
      throw error;
    }
  }

  async updateProductReviewStats(productId) {
    try {
      const reviewStats = await Review.aggregate([
        { $match: { product: productId } },
        {
          $group: {
            _id: '$product',
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]);

      if (reviewStats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
          averageRating: reviewStats[0].averageRating,
          totalReviews: reviewStats[0].totalReviews
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des statistiques', error);
      throw error;
    }
  }

  async deleteReview(reviewId, userId) {
    try {
      const review = await Review.findOneAndDelete({
        _id: reviewId,
        user: userId
      });

      if (!review) {
        throw new Error('Avis non trouvé ou non autorisé');
      }

      // Mettre à jour les statistiques du produit
      await this.updateProductReviewStats(review.product);

      return review;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'avis', error);
      throw error;
    }
  }
}

module.exports = new ReviewService();
