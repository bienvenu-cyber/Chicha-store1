const LoyaltyProgram = require('../models/LoyaltyProgram');
const User = require('../models/User');
const crypto = require('crypto');

class LoyaltyService {
  async initializeLoyaltyProgram(userId) {
    try {
      // Vérifier si un programme existe déjà
      let loyaltyProgram = await LoyaltyProgram.findOne({ user: userId });

      if (!loyaltyProgram) {
        const referralCode = this.generateReferralCode();
        
        loyaltyProgram = new LoyaltyProgram({
          user: userId,
          referralCode,
          points: 50 // Points bonus d'inscription
        });

        await loyaltyProgram.save();
      }

      return loyaltyProgram;
    } catch (error) {
      console.error('Erreur d\'initialisation du programme de fidélité', error);
      throw error;
    }
  }

  async addPointsFromPurchase(userId, orderTotal) {
    try {
      const loyaltyProgram = await LoyaltyProgram.findOne({ user: userId });
      
      if (!loyaltyProgram) {
        throw new Error('Programme de fidélité non trouvé');
      }

      // 1 point pour chaque euro dépensé
      const pointsEarned = Math.floor(orderTotal);
      
      loyaltyProgram.addPoints(pointsEarned, 'purchase', `Achat de ${orderTotal}€`);
      
      await loyaltyProgram.save();

      return loyaltyProgram;
    } catch (error) {
      console.error('Erreur d\'ajout de points', error);
      throw error;
    }
  }

  async claimReward(userId, rewardId) {
    try {
      const loyaltyProgram = await LoyaltyProgram.findOne({ user: userId });
      
      if (!loyaltyProgram) {
        throw new Error('Programme de fidélité non trouvé');
      }

      const reward = this.getRewardById(rewardId);
      
      loyaltyProgram.claimReward(reward);
      
      await loyaltyProgram.save();

      return loyaltyProgram;
    } catch (error) {
      console.error('Erreur de récupération de récompense', error);
      throw error;
    }
  }

  async processReferral(referrerUserId, referredEmail) {
    try {
      const referrerProgram = await LoyaltyProgram.findOne({ user: referrerUserId });
      
      if (!referrerProgram) {
        throw new Error('Programme de fidélité non trouvé');
      }

      // Vérifier que l'email référé n'est pas déjà un utilisateur
      const existingUser = await User.findOne({ email: referredEmail });
      
      if (existingUser) {
        throw new Error('Utilisateur déjà existant');
      }

      // Ajouter des points de parrainage
      referrerProgram.addPoints(50, 'referral', `Parrainage de ${referredEmail}`);
      
      await referrerProgram.save();

      return referrerProgram;
    } catch (error) {
      console.error('Erreur de traitement du parrainage', error);
      throw error;
    }
  }

  async getLoyaltyProgramDetails(userId) {
    try {
      const loyaltyProgram = await LoyaltyProgram.findOne({ user: userId });
      
      if (!loyaltyProgram) {
        throw new Error('Programme de fidélité non trouvé');
      }

      return {
        points: loyaltyProgram.points,
        tierLevel: loyaltyProgram.tierLevel,
        referralCode: loyaltyProgram.referralCode,
        rewards: loyaltyProgram.rewards,
        pointsHistory: loyaltyProgram.pointsHistory
      };
    } catch (error) {
      console.error('Erreur de récupération des détails', error);
      throw error;
    }
  }

  private generateReferralCode() {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  private getRewardById(rewardId) {
    // Définir les récompenses disponibles
    const rewards = {
      'DISCOUNT_10': { 
        _id: 'DISCOUNT_10', 
        name: 'Réduction 10%', 
        pointsCost: 100 
      },
      'FREE_SHIPPING': { 
        _id: 'FREE_SHIPPING', 
        name: 'Livraison Gratuite', 
        pointsCost: 200 
      },
      'FREE_PRODUCT': { 
        _id: 'FREE_PRODUCT', 
        name: 'Chicha Offerte', 
        pointsCost: 500 
      }
    };

    const reward = rewards[rewardId];

    if (!reward) {
      throw new Error('Récompense non trouvée');
    }

    return reward;
  }
}

module.exports = new LoyaltyService();
