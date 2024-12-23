const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

class WishlistService {
  async addToWishlist(userId, productId) {
    try {
      // Vérifier si le produit existe
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Produit non trouvé');
      }

      // Trouver ou créer la wishlist de l'utilisateur
      let wishlist = await Wishlist.findOne({ user: userId });
      
      if (!wishlist) {
        wishlist = new Wishlist({ user: userId, products: [] });
      }

      // Vérifier si le produit est déjà dans la wishlist
      const productExists = wishlist.products.some(
        p => p.toString() === productId
      );

      if (productExists) {
        throw new Error('Produit déjà dans la wishlist');
      }

      // Ajouter le produit
      wishlist.products.push(productId);
      await wishlist.save();

      return wishlist;
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la wishlist', error);
      throw error;
    }
  }

  async removeFromWishlist(userId, productId) {
    try {
      const wishlist = await Wishlist.findOne({ user: userId });

      if (!wishlist) {
        throw new Error('Wishlist non trouvée');
      }

      // Filtrer le produit
      wishlist.products = wishlist.products.filter(
        p => p.toString() !== productId
      );

      await wishlist.save();
      return wishlist;
    } catch (error) {
      console.error('Erreur lors de la suppression de la wishlist', error);
      throw error;
    }
  }

  async getUserWishlist(userId) {
    try {
      const wishlist = await Wishlist.findOne({ user: userId })
        .populate({
          path: 'products',
          populate: {
            path: 'category',
            select: 'name'
          }
        });

      return wishlist ? wishlist.products : [];
    } catch (error) {
      console.error('Erreur lors de la récupération de la wishlist', error);
      throw error;
    }
  }

  async isInWishlist(userId, productId) {
    try {
      const wishlist = await Wishlist.findOne({ 
        user: userId,
        products: productId 
      });

      return !!wishlist;
    } catch (error) {
      console.error('Erreur de vérification de la wishlist', error);
      throw error;
    }
  }
}

module.exports = new WishlistService();
