import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const AnalyticsArchiveSchema = new mongoose.Schema({
  // Métadonnées de l'archive
  archiveType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  periodStart: {
    type: Date,
    required: true,
    index: true
  },
  periodEnd: {
    type: Date,
    required: true
  },

  // Agrégations par article
  articleAnalytics: [{
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: true
    },
    title: String,
    
    // Métriques agrégées
    totalEvents: {
      view: { type: Number, default: 0 },
      like: { type: Number, default: 0 },
      comment: { type: Number, default: 0 },
      share: { type: Number, default: 0 }
    },
    
    // Distribution des événements
    eventDistribution: {
      byPlatform: {
        facebook: { type: Number, default: 0 },
        twitter: { type: Number, default: 0 },
        linkedin: { type: Number, default: 0 },
        whatsapp: { type: Number, default: 0 },
        email: { type: Number, default: 0 }
      },
      byUserType: {
        authenticated: { type: Number, default: 0 },
        anonymous: { type: Number, default: 0 }
      }
    },

    // Statistiques de temps
    readTimeStats: {
      averageReadTime: { type: Number, default: 0 },
      readTimeDistribution: [{
        range: String,
        percentage: Number
      }]
    },

    // Engagement
    engagementRates: {
      likeRate: { type: Number, default: 0 },
      commentRate: { type: Number, default: 0 },
      shareRate: { type: Number, default: 0 }
    }
  }],

  // Statistiques globales
  globalStats: {
    totalArticles: { type: Number, default: 0 },
    totalEvents: { 
      view: { type: Number, default: 0 },
      like: { type: Number, default: 0 },
      comment: { type: Number, default: 0 },
      share: { type: Number, default: 0 }
    },
    topPerformingArticles: [{
      articleId: mongoose.Schema.Types.ObjectId,
      title: String,
      totalEvents: Number
    }]
  },

  // Métadonnées de création
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 365 // Expire après 1 an
  }
}, {
  timestamps: true,
  indexes: [
    { archiveType: 1, periodStart: -1 }
  ]
});

// Ajouter la pagination
AnalyticsArchiveSchema.plugin(mongoosePaginate);

// Méthode statique pour créer une archive
AnalyticsArchiveSchema.statics.createArchive = async function(
  archiveType, 
  periodStart, 
  periodEnd
) {
  try {
    // Récupérer et agréger les événements
    const articleAnalytics = await mongoose.model('ArticleEvent').aggregate([
      {
        $match: {
          timestamp: {
            $gte: periodStart,
            $lt: periodEnd
          }
        }
      },
      {
        $group: {
          _id: '$articleId',
          totalEvents: {
            $sum: 1
          },
          eventTypes: {
            $push: '$type'
          },
          platforms: {
            $push: '$platform'
          },
          readDurations: {
            $push: '$readDuration'
          },
          userTypes: {
            $push: { 
              $cond: [
                { $ifNull: ['$userId', false] }, 
                'authenticated', 
                'anonymous' 
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'articles',
          localField: '_id',
          foreignField: '_id',
          as: 'articleDetails'
        }
      },
      { $unwind: '$articleDetails' },
      {
        $project: {
          articleId: '$_id',
          title: '$articleDetails.title',
          totalEvents: 1,
          eventTypes: 1,
          platforms: 1,
          readDurations: 1,
          userTypes: 1
        }
      }
    ]);

    // Créer l'archive
    const archive = new this({
      archiveType,
      periodStart,
      periodEnd,
      articleAnalytics: articleAnalytics.map(article => ({
        articleId: article.articleId,
        title: article.title,
        totalEvents: {
          view: article.eventTypes.filter(type => type === 'view').length,
          like: article.eventTypes.filter(type => type === 'like').length,
          comment: article.eventTypes.filter(type => type === 'comment').length,
          share: article.eventTypes.filter(type => type === 'share').length
        },
        eventDistribution: {
          byPlatform: {
            facebook: article.platforms.filter(p => p === 'facebook').length,
            twitter: article.platforms.filter(p => p === 'twitter').length,
            linkedin: article.platforms.filter(p => p === 'linkedin').length,
            whatsapp: article.platforms.filter(p => p === 'whatsapp').length,
            email: article.platforms.filter(p => p === 'email').length
          },
          byUserType: {
            authenticated: article.userTypes.filter(t => t === 'authenticated').length,
            anonymous: article.userTypes.filter(t => t === 'anonymous').length
          }
        },
        readTimeStats: {
          averageReadTime: article.readDurations.reduce((a, b) => a + b, 0) / article.readDurations.length,
          readTimeDistribution: this.calculateReadTimeDistribution(article.readDurations)
        }
      })),
      globalStats: {
        totalArticles: articleAnalytics.length,
        totalEvents: {
          view: articleAnalytics.reduce((sum, article) => sum + article.totalEvents.view, 0),
          like: articleAnalytics.reduce((sum, article) => sum + article.totalEvents.like, 0),
          comment: articleAnalytics.reduce((sum, article) => sum + article.totalEvents.comment, 0),
          share: articleAnalytics.reduce((sum, article) => sum + article.totalEvents.share, 0)
        },
        topPerformingArticles: articleAnalytics
          .sort((a, b) => b.totalEvents - a.totalEvents)
          .slice(0, 5)
          .map(article => ({
            articleId: article.articleId,
            title: article.title,
            totalEvents: article.totalEvents
          }))
      }
    });

    await archive.save();
    return archive;
  } catch (error) {
    console.error('Erreur lors de la création de l\'archive', error);
    throw error;
  }
};

// Méthode pour calculer la distribution du temps de lecture
AnalyticsArchiveSchema.statics.calculateReadTimeDistribution = function(readDurations) {
  const boundaries = [0, 30, 60, 120, 300, Infinity];
  const ranges = ['0-30s', '30-60s', '1-2min', '2-5min', '5min+', 'Autres'];
  
  const distribution = boundaries.map((boundary, index) => {
    const count = readDurations.filter(duration => 
      duration >= boundary && duration < boundaries[index + 1]
    ).length;
    
    return {
      range: ranges[index],
      percentage: Math.round((count / readDurations.length) * 100)
    };
  });

  return distribution;
};

const AnalyticsArchive = mongoose.model('AnalyticsArchive', AnalyticsArchiveSchema);

export default AnalyticsArchive;
