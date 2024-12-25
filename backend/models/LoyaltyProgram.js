import mongoose from 'mongoose';
import crypto from 'crypto';

const rewardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  pointsCost: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['discount', 'product', 'experience', 'exclusive'],
    required: true
  },
  expiresAt: Date,
  limitedQuantity: {
    total: Number,
    remaining: Number
  },
  requiredTier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  }
});

const loyaltyProgramSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  tierLevel: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  tierProgress: {
    currentTier: String,
    nextTier: String,
    pointsToNextTier: Number
  },
  pointsHistory: [{
    type: {
      type: String,
      enum: ['purchase', 'signup', 'referral', 'bonus', 'social_share', 'review']
    },
    points: Number,
    description: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  rewards: [{
    rewardId: String,
    name: String,
    pointsCost: Number,
    claimedAt: Date,
    status: {
      type: String,
      enum: ['active', 'used', 'expired'],
      default: 'active'
    }
  }],
  referralCode: {
    type: String,
    unique: true,
    default: () => crypto.randomBytes(6).toString('hex')
  },
  referrals: [{
    referredUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    pointsEarned: Number,
    referredAt: Date
  }],
  achievements: [{
    name: String,
    description: String,
    pointsAwarded: Number,
    unlockedAt: Date
  }]
}, {
  timestamps: true
});

// Méthodes avancées de gestion des points
loyaltyProgramSchema.methods.addPoints = function(points, type, description) {
  this.points += points;
  this.pointsHistory.push({ type, points, description });
  this._updateTierProgress();
};

loyaltyProgramSchema.methods._updateTierProgress = function() {
  const tierThresholds = {
    bronze: { next: 'silver', threshold: 200 },
    silver: { next: 'gold', threshold: 500 },
    gold: { next: 'platinum', threshold: 1000 },
    platinum: { next: null, threshold: Infinity }
  };

  const currentTier = this.tierLevel;
  const tierInfo = tierThresholds[currentTier];

  if (this.points >= tierInfo.threshold) {
    this.tierLevel = tierInfo.next || currentTier;
  }

  this.tierProgress = {
    currentTier: currentTier,
    nextTier: tierInfo.next,
    pointsToNextTier: tierInfo.next 
      ? tierInfo.threshold - this.points 
      : 0
  };
};

loyaltyProgramSchema.methods.claimReward = function(reward) {
  if (this.points < reward.pointsCost) {
    throw new Error('Points insuffisants');
  }

  if (reward.requiredTier && this.tierLevel !== reward.requiredTier) {
    throw new Error('Niveau de fidélité insuffisant');
  }

  if (reward.limitedQuantity && reward.limitedQuantity.remaining <= 0) {
    throw new Error('Récompense épuisée');
  }

  this.points -= reward.pointsCost;
  this.rewards.push({
    rewardId: reward._id,
    name: reward.name,
    pointsCost: reward.pointsCost,
    claimedAt: new Date(),
    status: 'active'
  });

  // Mise à jour de la quantité limitée
  if (reward.limitedQuantity) {
    reward.limitedQuantity.remaining -= 1;
  }
};

loyaltyProgramSchema.methods.addReferral = function(referredUser) {
  const referralPoints = 50; // Points pour un parrainage réussi

  this.referrals.push({
    referredUser: referredUser._id,
    pointsEarned: referralPoints,
    referredAt: new Date()
  });

  this.addPoints(referralPoints, 'referral', `Parrainage de ${referredUser.name}`);
};

loyaltyProgramSchema.methods.unlockAchievement = function(achievement) {
  this.achievements.push({
    name: achievement.name,
    description: achievement.description,
    pointsAwarded: achievement.pointsAwarded,
    unlockedAt: new Date()
  });

  this.addPoints(achievement.pointsAwarded, 'bonus', `Achievement: ${achievement.name}`);
};

const LoyaltyProgram = mongoose.model('LoyaltyProgram', loyaltyProgramSchema);
const Reward = mongoose.model('Reward', rewardSchema);

export default { LoyaltyProgram, Reward };
