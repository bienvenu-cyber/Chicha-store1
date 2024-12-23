const mongoose = require('mongoose');
const User = require('../models/User');
const ChichaMix = require('../models/ChichaMix');
const CommunityPost = require('../models/CommunityPost');

class CommunityEngagementService {
  async createCommunityPost(userId, content, type = 'mix_share') {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(userId).session(session);
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      const post = new CommunityPost({
        user: userId,
        content,
        type,
        likes: 0,
        comments: [],
        shares: 0
      });

      await post.save({ session });

      // Mise à jour des statistiques utilisateur
      user.communityRank = (user.communityRank || 0) + 10;
      user.socialInteractions = (user.socialInteractions || 0) + 1;
      
      await user.save({ session });

      await session.commitTransaction();
      session.endSession();

      return post;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async interactWithPost(userId, postId, interactionType) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const post = await CommunityPost.findById(postId).session(session);
      const user = await User.findById(userId).session(session);

      if (!post || !user) {
        throw new Error('Post ou utilisateur non trouvé');
      }

      switch (interactionType) {
        case 'like':
          post.likes += 1;
          user.socialInteractions += 1;
          break;
        case 'comment':
          post.comments.push({
            user: userId,
            content: 'Commentaire générique',
            createdAt: new Date()
          });
          user.socialInteractions += 2;
          break;
        case 'share':
          post.shares += 1;
          user.socialInteractions += 3;
          break;
        default:
          throw new Error('Type d\'interaction non valide');
      }

      await post.save({ session });
      await user.save({ session });

      await session.commitTransaction();
      session.endSession();

      return post;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async recommendCommunityMembers(userId, k = 5) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Recommandation basée sur des critères multiples
    const similarUsers = await User.aggregate([
      {
        $match: {
          _id: { $ne: mongoose.Types.ObjectId(userId) },
          location: user.location,
          age: { 
            $gte: user.age - 5, 
            $lte: user.age + 5 
          }
        }
      },
      {
        $addFields: {
          similarityScore: {
            $sum: [
              { $cond: [{ $eq: ['$preferredFlavors', user.preferredFlavors] }, 10, 0] },
              { $cond: [{ $eq: ['$communityRank', user.communityRank] }, 5, 0] }
            ]
          }
        }
      },
      { $sort: { similarityScore: -1 } },
      { $limit: k }
    ]);

    return similarUsers;
  }

  async createCommunityChallenge(challengeData) {
    const challenge = new CommunityChallenge(challengeData);
    await challenge.save();

    // Notification des membres de la communauté
    await this.notifyCommunityMembers(challenge);

    return challenge;
  }

  async notifyCommunityMembers(challenge) {
    // Logique de notification via email, push, etc.
    const eligibleUsers = await User.find({
      communityRank: { $gte: challenge.minimumRank }
    });

    // Envoi de notifications
    eligibleUsers.forEach(user => {
      // Mécanisme de notification à implémenter
    });
  }

  async trackCommunityAchievements(userId) {
    const user = await User.findById(userId);
    const achievements = [];

    // Achievements communautaires
    const communityAchievements = [
      {
        name: 'Première Publication',
        condition: () => user.socialInteractions >= 1,
        reward: 50
      },
      {
        name: 'Influenceur',
        condition: () => user.socialInteractions >= 100,
        reward: 500
      }
    ];

    for (const achievement of communityAchievements) {
      if (achievement.condition()) {
        achievements.push({
          name: achievement.name,
          pointsAwarded: achievement.reward
        });
      }
    }

    return achievements;
  }
}

module.exports = new CommunityEngagementService();
