const mongoose = require('mongoose');

const ArticleEventSchema = new mongoose.Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  type: {
    type: String,
    enum: ['view', 'like', 'comment', 'share'],
    required: true
  },
  platform: {
    type: String,
    enum: ['facebook', 'twitter', 'linkedin', 'whatsapp', 'email', null],
    default: null
  },
  readDuration: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  }
}, { 
  timestamps: true,
  indexes: [
    { articleId: 1, type: 1, timestamp: -1 }
  ]
});

const ArticleAnalyticsSchema = new mongoose.Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
    unique: true,
    index: true
  },
  totalViews: {
    type: Number,
    default: 0
  },
  uniqueViews: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  shares: {
    type: {
      facebook: { type: Number, default: 0 },
      twitter: { type: Number, default: 0 },
      linkedin: { type: Number, default: 0 },
      whatsapp: { type: Number, default: 0 },
      email: { type: Number, default: 0 }
    },
    default: {
      facebook: 0,
      twitter: 0,
      linkedin: 0,
      whatsapp: 0,
      email: 0
    }
  },
  readTimeDistribution: {
    type: [{
      range: String,
      percentage: Number
    }],
    default: []
  },
  topReferrers: {
    type: [{
      source: String,
      visits: Number
    }],
    default: []
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

// Méthode statique pour mettre à jour les analytics
ArticleAnalyticsSchema.statics.updateAnalytics = async function(
  articleId, 
  eventType, 
  additionalData = {}
) {
  try {
    let analytics = await this.findOne({ articleId });
    
    if (!analytics) {
      analytics = new this({ articleId });
    }

    switch (eventType) {
      case 'view':
        analytics.totalViews++;
        break;
      case 'like':
        analytics.likes++;
        break;
      case 'comment':
        analytics.comments++;
        break;
      case 'share':
        const platform = additionalData.platform;
        if (platform && analytics.shares[platform] !== undefined) {
          analytics.shares[platform]++;
        }
        break;
    }

    analytics.lastUpdated = new Date();
    await analytics.save();

    return analytics;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des analytics', error);
    throw error;
  }
};

const ArticleEvent = mongoose.model('ArticleEvent', ArticleEventSchema);
const ArticleAnalytics = mongoose.model('ArticleAnalytics', ArticleAnalyticsSchema);

module.exports = {
  ArticleEvent,
  ArticleAnalytics
};
