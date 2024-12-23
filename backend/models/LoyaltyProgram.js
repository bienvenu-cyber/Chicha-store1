const mongoose = require('mongoose');

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
  pointsHistory: [{
    type: {
      type: String,
      enum: ['purchase', 'signup', 'referral', 'bonus']
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
    claimedAt: Date
  }],
  referralCode: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

loyaltyProgramSchema.methods.addPoints = function(points, type, description) {
  this.points += points;
  this.pointsHistory.push({ type, points, description });
  this.updateTier();
};

loyaltyProgramSchema.methods.updateTier = function() {
  if (this.points >= 1000) this.tierLevel = 'platinum';
  else if (this.points >= 500) this.tierLevel = 'gold';
  else if (this.points >= 200) this.tierLevel = 'silver';
};

loyaltyProgramSchema.methods.claimReward = function(reward) {
  if (this.points < reward.pointsCost) {
    throw new Error('Points insuffisants');
  }

  this.points -= reward.pointsCost;
  this.rewards.push({
    rewardId: reward._id,
    name: reward.name,
    pointsCost: reward.pointsCost,
    claimedAt: new Date()
  });
};

module.exports = mongoose.model('LoyaltyProgram', loyaltyProgramSchema);
