import ChichaMix from '../models/ChichaMix.js.js';
import User from '../models/User.js.js';

export default class MixService {
  async createPersonalMix(userId, mixData) {
    try {
      const mix = new ChichaMix({
        user: userId,
        ...mixData,
        totalIntensity: this.calculateTotalIntensity(mixData.ingredients)
      });

      await mix.save();
      return mix;
    } catch (error) {
      throw new Error(`Erreur de création de mélange : ${error.message}`);
    }
  }

  calculateTotalIntensity(ingredients) {
    return ingredients.reduce((total, ingredient) => total + ingredient.intensity, 0);
  }

  async getUserMixes(userId, options = {}) {
    const { 
      limit = 10, 
      page = 1, 
      sortBy = 'createdAt', 
      order = 'desc' 
    } = options;

    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;

    try {
      const mixes = await ChichaMix.find({ user: userId })
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await ChichaMix.countDocuments({ user: userId });

      return {
        mixes,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur de récupération des mélanges : ${error.message}`);
    }
  }

  async getPublicMixes(options = {}) {
    const { 
      limit = 20, 
      page = 1, 
      minLikes = 0 
    } = options;

    const skip = (page - 1) * limit;

    try {
      const mixes = await ChichaMix.find({ 
        isPublic: true, 
        likes: { $gte: minLikes } 
      })
      .sort({ likes: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username')
      .lean();

      const total = await ChichaMix.countDocuments({ 
        isPublic: true, 
        likes: { $gte: minLikes } 
      });

      return {
        mixes,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur de récupération des mélanges publics : ${error.message}`);
    }
  }

  async likeMix(mixId, userId) {
    try {
      const mix = await ChichaMix.findById(mixId);
      
      if (!mix) {
        throw new Error('Mélange non trouvé');
      }

      // Logique de like unique par utilisateur
      const userLiked = mix.likes.includes(userId);
      
      if (userLiked) {
        mix.likes = mix.likes.filter(id => id.toString() !== userId);
      } else {
        mix.likes.push(userId);
      }

      await mix.save();
      return mix;
    } catch (error) {
      throw new Error(`Erreur de like : ${error.message}`);
    }
  }
}

export default new MixService();
