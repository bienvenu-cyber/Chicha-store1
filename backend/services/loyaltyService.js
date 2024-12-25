import { LoyaltyProgram, Reward } from '../models/LoyaltyProgram.js.js';
import User from '../models/User.js.js';
import crypto from 'crypto';
import mongoose from 'mongoose';

export default class LoyaltyService {
  async initializeLoyaltyProgram(userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let loyaltyProgram = await LoyaltyProgram.findOne({ user: userId }).session(session);

      if (!loyaltyProgram) {
        const referralCode = this.generateReferralCode();
        
        loyaltyProgram = new LoyaltyProgram({
          user: userId,
          referralCode,
          points: 50, // Points bonus d'inscription
          tierLevel: 'bronze'
        });

        await loyaltyProgram.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      return loyaltyProgram;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Erreur d\'initialisation du programme de fidélité', error);
      throw error;
    }
  }

  async addPointsFromPurchase(userId, orderTotal, products) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const loyaltyProgram = await LoyaltyProgram.findOne({ user: userId }).session(session);
      
      if (!loyaltyProgram) {
        throw new Error('Programme de fidélité non trouvé');
      }

      // Points basés sur le total et bonus pour certains produits
      const basePoints = Math.floor(orderTotal);
      const bonusPoints = this._calculateBonusPoints(products);
      const totalPoints = basePoints + bonusPoints;
      
      loyaltyProgram.addPoints(totalPoints, 'purchase', `Achat de ${orderTotal}€ avec bonus`);
      
      // Vérifier et débloquer des achievements
      await this._checkAchievements(loyaltyProgram, orderTotal);
      
      await loyaltyProgram.save({ session });
      await session.commitTransaction();
      session.endSession();

      return loyaltyProgram;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Erreur d\'ajout de points', error);
      throw error;
    }
  }

  async claimReward(userId, rewardId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const loyaltyProgram = await LoyaltyProgram.findOne({ user: userId }).session(session);
      
      if (!loyaltyProgram) {
        throw new Error('Programme de fidélité non trouvé');
      }

      const reward = await Reward.findById(rewardId).session(session);
      
      if (!reward) {
        throw new Error('Récompense non trouvée');
      }

      loyaltyProgram.claimReward(reward);
      
      await loyaltyProgram.save({ session });
      await reward.save({ session });
      
      await session.commitTransaction();
      session.endSession();

      return { loyaltyProgram, reward };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Erreur de récupération de récompense', error);
      throw error;
    }
  }

  async processReferral(referrerUserId, referredEmail) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const referrerProgram = await LoyaltyProgram.findOne({ user: referrerUserId }).session(session);
      
      if (!referrerProgram) {
        throw new Error('Programme de fidélité non trouvé');
      }

      const existingUser = await User.findOne({ email: referredEmail });
      
      if (existingUser) {
        throw new Error('Utilisateur déjà existant');
      }

      referrerProgram.addPoints(50, 'referral', `Parrainage de ${referredEmail}`);
      
      await referrerProgram.save({ session });
      await session.commitTransaction();
      session.endSession();

      return referrerProgram;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Erreur de traitement du parrainage', error);
      throw error;
    }
  }

  async getLoyaltyProgramDetails(userId) {
    try {
      const loyaltyProgram = await LoyaltyProgram.findOne({ user: userId })
        .populate('rewards')
        .populate('referrals.referredUser');
      
      if (!loyaltyProgram) {
        throw new Error('Programme de fidélité non trouvé');
      }

      return {
        points: loyaltyProgram.points,
        tierLevel: loyaltyProgram.tierLevel,
        tierProgress: loyaltyProgram.tierProgress,
        referralCode: loyaltyProgram.referralCode,
        rewards: loyaltyProgram.rewards,
        pointsHistory: loyaltyProgram.pointsHistory,
        referrals: loyaltyProgram.referrals,
        achievements: loyaltyProgram.achievements
      };
    } catch (error) {
      console.error('Erreur de récupération des détails', error);
      throw error;
    }
  }

  async createReward(rewardData) {
    try {
      const reward = new Reward(rewardData);
      await reward.save();
      return reward;
    } catch (error) {
      console.error('Erreur de création de récompense', error);
      throw error;
    }
  }

  // Méthodes privées
  _calculateBonusPoints(products) {
    return products.reduce((bonus, product) => {
      // Bonus pour certains produits premium
      if (product.isPremium) return bonus + 10;
      // Bonus pour quantité
      if (product.quantity > 2) return bonus + 5;
      return bonus;
    }, 0);
  }

  async _checkAchievements(loyaltyProgram, orderTotal) {
    const achievements = [
      {
        name: 'Premier Achat',
        description: 'Effectuer son premier achat',
        pointsAwarded: 25,
        condition: () => true
      },
      {
        name: 'Achat de Luxe',
        description: 'Dépenser plus de 200€ en une seule commande',
        pointsAwarded: 50,
        condition: () => orderTotal > 200
      }
    ];

    for (const achievement of achievements) {
      if (achievement.condition()) {
        loyaltyProgram.unlockAchievement(achievement);
      }
    }
  }

  generateReferralCode() {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }
}

export default new LoyaltyService();
