const mongoose = require('mongoose');
const ChichaMix = require('../models/ChichaMix');
const User = require('../models/User');
const LoyaltyProgram = require('../models/LoyaltyProgram');

class MixCreationGameService {
  async startMixCreationChallenge(userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(userId).session(session);
      const loyaltyProgram = await LoyaltyProgram.findOne({ user: userId }).session(session);

      if (!user || !loyaltyProgram) {
        throw new Error('Utilisateur ou programme de fidélité non trouvé');
      }

      const challenge = {
        id: new mongoose.Types.ObjectId(),
        type: this.generateChallengeType(),
        difficulty: this.calculateChallengeDifficulty(user),
        rewards: this.calculateChallengeRewards(loyaltyProgram.tierLevel),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
      };

      user.activeChallenges.push(challenge);
      await user.save({ session });

      await session.commitTransaction();
      session.endSession();

      return challenge;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  generateChallengeType() {
    const challengeTypes = [
      'flavor_explorer',
      'mix_master',
      'exotic_blend',
      'classic_revival',
      'community_favorite'
    ];

    return challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
  }

  calculateChallengeDifficulty(user) {
    const baseScore = user.mixCreationSkill || 1;
    const randomFactor = Math.random() * 0.4 + 0.8; // Entre 0.8 et 1.2
    
    return Math.round(baseScore * randomFactor);
  }

  calculateChallengeRewards(tierLevel) {
    const rewardTiers = {
      'bronze': { points: 50, xp: 10 },
      'silver': { points: 100, xp: 25 },
      'gold': { points: 250, xp: 50 },
      'platinum': { points: 500, xp: 100 }
    };

    return rewardTiers[tierLevel] || rewardTiers['bronze'];
  }

  async submitMixCreation(userId, mixData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(userId).session(session);
      const loyaltyProgram = await LoyaltyProgram.findOne({ user: userId }).session(session);

      if (!user || !loyaltyProgram) {
        throw new Error('Utilisateur ou programme de fidélité non trouvé');
      }

      const mix = new ChichaMix({
        ...mixData,
        user: userId,
        createdAt: new Date(),
        status: 'draft'
      });

      await mix.save({ session });

      // Vérification du défi actif
      const activeChallenge = user.activeChallenges.find(c => c.status === 'active');
      
      if (activeChallenge) {
        const challengeEvaluation = this.evaluateMixForChallenge(mix, activeChallenge);
        
        if (challengeEvaluation.completed) {
          activeChallenge.status = 'completed';
          
          // Récompenses
          loyaltyProgram.addPoints(
            activeChallenge.rewards.points, 
            'challenge', 
            `Défi ${activeChallenge.type} terminé`
          );

          user.mixCreationSkill = (user.mixCreationSkill || 0) + 1;
        }
      }

      await user.save({ session });
      await loyaltyProgram.save({ session });

      await session.commitTransaction();
      session.endSession();

      return { mix, challengeResult: activeChallenge };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  evaluateMixForChallenge(mix, challenge) {
    const evaluationCriteria = {
      'flavor_explorer': () => mix.flavors.length > 3,
      'mix_master': () => mix.complexity > 7,
      'exotic_blend': () => mix.flavors.some(f => f.isExotic),
      'classic_revival': () => mix.flavors.some(f => f.isTraditional),
      'community_favorite': () => false // À définir selon les interactions communautaires
    };

    const evaluationMethod = evaluationCriteria[challenge.type];
    const completed = evaluationMethod ? evaluationMethod() : false;

    return {
      completed,
      feedback: completed 
        ? 'Défi accompli avec succès !' 
        : 'Continuez à explorer et créer !'
    };
  }

  async getCommunityMixTrends() {
    const trendingMixes = await ChichaMix.aggregate([
      { $match: { status: 'published' } },
      { 
        $addFields: { 
          popularityScore: { 
            $sum: ['$likes', '$shares', '$comments'] 
          }
        }
      },
      { $sort: { popularityScore: -1 } },
      { $limit: 10 }
    ]);

    return trendingMixes;
  }
}

module.exports = new MixCreationGameService();
