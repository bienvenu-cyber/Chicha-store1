const { ArticleEvent, ArticleAnalytics } = require('../models/ArticleAnalytics');
const Article = require('../models/Article');
const mongoose = require('mongoose');

class ArticleAnalyticsController {
  // Enregistrer un événement d'article
  async trackEvent(req, res) {
    try {
      const { 
        type, 
        articleId, 
        platform, 
        duration 
      } = req.body;

      // Validation de base
      if (!articleId || !type) {
        return res.status(400).json({ 
          message: 'ID d\'article et type d\'événement requis' 
        });
      }

      // Vérifier si l'article existe
      const article = await Article.findById(articleId);
      if (!article) {
        return res.status(404).json({ 
          message: 'Article non trouvé' 
        });
      }

      // Créer l'événement
      const event = new ArticleEvent({
        articleId,
        userId: req.user ? req.user._id : null,
        type,
        platform: platform || null,
        readDuration: duration || 0,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      await event.save();

      // Mettre à jour les analytics
      await ArticleAnalytics.updateAnalytics(
        articleId, 
        type, 
        { platform }
      );

      res.status(201).json({ 
        message: 'Événement enregistré avec succès' 
      });
    } catch (error) {
      console.error('Erreur lors du tracking', error);
      res.status(500).json({ 
        message: 'Erreur serveur lors du tracking' 
      });
    }
  }

  // Récupérer les analytics pour un article
  async getArticleAnalytics(req, res) {
    try {
      const { articleId } = req.params;

      // Vérifier les permissions
      if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ 
          message: 'Accès non autorisé' 
        });
      }

      // Récupérer les analytics
      const analytics = await ArticleAnalytics.findOne({ 
        articleId 
      });

      if (!analytics) {
        return res.status(404).json({ 
          message: 'Analytics non trouvés' 
        });
      }

      // Calculer les taux d'engagement
      const engagement = {
        likeRate: analytics.likes / (analytics.totalViews || 1),
        commentRate: analytics.comments / (analytics.totalViews || 1),
        shareRate: Object.values(analytics.shares).reduce((a, b) => a + b, 0) / (analytics.totalViews || 1)
      };

      // Récupérer le titre de l'article
      const article = await Article.findById(articleId);

      res.json({
        articleId: analytics.articleId,
        title: article.title,
        views: analytics.totalViews,
        uniqueViews: analytics.uniqueViews,
        likes: analytics.likes,
        comments: analytics.comments,
        averageReadTime: await this.calculateAverageReadTime(articleId),
        shareCount: analytics.shares,
        topReferrers: analytics.topReferrers,
        engagement,
        readTimeDistribution: await this.calculateReadTimeDistribution(articleId)
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics', error);
      res.status(500).json({ 
        message: 'Erreur serveur' 
      });
    }
  }

  // Récupérer les articles les plus populaires
  async getTopArticles(req, res) {
    try {
      // Vérifier les permissions
      if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ 
          message: 'Accès non autorisé' 
        });
      }

      const { 
        period = 'weekly', 
        limit = 5 
      } = req.query;

      // Définir la période
      const periodMap = {
        daily: 1,
        weekly: 7,
        monthly: 30
      };

      const days = periodMap[period] || 7;
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Agréger les analytics
      const topArticles = await ArticleAnalytics.aggregate([
        {
          $lookup: {
            from: 'articles', // Nom de la collection d'articles
            localField: 'articleId',
            foreignField: '_id',
            as: 'articleDetails'
          }
        },
        { $unwind: '$articleDetails' },
        {
          $match: {
            'lastUpdated': { $gte: cutoffDate }
          }
        },
        {
          $project: {
            articleId: '$articleId',
            title: '$articleDetails.title',
            views: '$totalViews',
            likes: '$likes',
            comments: '$comments'
          }
        },
        { $sort: { views: -1 } },
        { $limit: Number(limit) }
      ]);

      res.json(topArticles);
    } catch (error) {
      console.error('Erreur lors de la récupération des articles populaires', error);
      res.status(500).json({ 
        message: 'Erreur serveur' 
      });
    }
  }

  // Calculer le temps de lecture moyen
  async calculateAverageReadTime(articleId) {
    try {
      const result = await ArticleEvent.aggregate([
        { 
          $match: { 
            articleId: mongoose.Types.ObjectId(articleId),
            type: 'view',
            readDuration: { $gt: 0 }
          }
        },
        {
          $group: {
            _id: null,
            averageReadTime: { $avg: '$readDuration' }
          }
        }
      ]);

      return result[0] ? Math.round(result[0].averageReadTime) : 0;
    } catch (error) {
      console.error('Erreur de calcul du temps de lecture', error);
      return 0;
    }
  }

  // Distribution du temps de lecture
  async calculateReadTimeDistribution(articleId) {
    try {
      const result = await ArticleEvent.aggregate([
        { 
          $match: { 
            articleId: mongoose.Types.ObjectId(articleId),
            type: 'view',
            readDuration: { $gt: 0 }
          }
        },
        {
          $bucket: {
            groupBy: '$readDuration',
            boundaries: [0, 30, 60, 120, 300, Infinity],
            default: 'Autres',
            output: {
              count: { $sum: 1 }
            }
          }
        },
        {
          $project: {
            _id: 0,
            range: {
              $switch: {
                branches: [
                  { case: { $eq: ['$_id', 0] }, then: '0-30s' },
                  { case: { $eq: ['$_id', 30] }, then: '30-60s' },
                  { case: { $eq: ['$_id', 60] }, then: '1-2min' },
                  { case: { $eq: ['$_id', 120] }, then: '2-5min' },
                  { case: { $eq: ['$_id', 300] }, then: '5min+' },
                  { case: { $eq: ['$_id', 'Autres'] }, then: 'Autres' }
                ]
              }
            },
            count: 1
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$count' },
            ranges: { 
              $push: { 
                range: '$range', 
                count: '$count' 
              } 
            }
          }
        },
        {
          $unwind: '$ranges'
        },
        {
          $project: {
            _id: 0,
            range: '$ranges.range',
            percentage: { 
              $round: [
                { $multiply: [{ $divide: ['$ranges.count', '$total'] }, 100] }, 
                2 
              ] 
            }
          }
        }
      ]);

      return result;
    } catch (error) {
      console.error('Erreur de calcul de la distribution du temps de lecture', error);
      return [];
    }
  }
}

module.exports = new ArticleAnalyticsController();
