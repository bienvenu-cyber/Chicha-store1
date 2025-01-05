import AnalyticsArchive from '../models/AnalyticsArchive.js';
import ArticleAnalytics from '../models/ArticleAnalytics.js';
import logger from '../config/logger.js';
import analyticsCleanupService from '../services/analyticsCleanupService.js';

class AnalyticsArchiveController {
  // Récupérer la liste des archives
  async listArchives(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        archiveType,
        sortBy = 'periodStart',
        sortOrder = 'desc',
        minArticles,
        maxArticles,
        startDate,
        endDate,
        minTotalEvents,
        maxTotalEvents
      } = req.query;

      // Construction dynamique de la requête
      const query = {};

      // Filtres par type d'archive
      if (archiveType) {
        query.archiveType = archiveType;
      }

      // Filtres par nombre d'articles
      if (minArticles || maxArticles) {
        query['globalStats.totalArticles'] = {};
        if (minArticles) query['globalStats.totalArticles'].$gte = parseInt(minArticles);
        if (maxArticles) query['globalStats.totalArticles'].$lte = parseInt(maxArticles);
      }

      // Filtres par période
      if (startDate || endDate) {
        query.periodStart = {};
        if (startDate) query.periodStart.$gte = new Date(startDate);
        if (endDate) query.periodStart.$lte = new Date(endDate);
      }

      // Filtres par nombre total d'événements
      if (minTotalEvents || maxTotalEvents) {
        query['globalStats.totalEvents.view'] = {};
        if (minTotalEvents) {
          query['globalStats.totalEvents.view'].$gte = parseInt(minTotalEvents);
        }
        if (maxTotalEvents) {
          query['globalStats.totalEvents.view'].$lte = parseInt(maxTotalEvents);
        }
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { 
          [sortBy]: sortOrder === 'desc' ? -1 : 1 
        },
        select: 'archiveType periodStart periodEnd globalStats.totalArticles globalStats.totalEvents createdAt'
      };

      const archives = await AnalyticsArchive.paginate(query, options);

      res.json({
        archives: archives.docs,
        totalPages: archives.totalPages,
        currentPage: archives.page,
        totalArchives: archives.totalDocs
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des archives', error);
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des archives' 
      });
    }
  }

  // Détails d'une archive spécifique
  async getArchiveDetails(req, res) {
    try {
      const { archiveId } = req.params;

      const archive = await AnalyticsArchive.findById(archiveId)
        .populate('articleAnalytics.articleId', 'title');

      if (!archive) {
        return res.status(404).json({ 
          message: 'Archive non trouvée' 
        });
      }

      res.json(archive);
    } catch (error) {
      logger.error('Erreur lors de la récupération des détails de l\'archive', error);
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des détails de l\'archive' 
      });
    }
  }

  // Créer une archive manuellement
  async createManualArchive(req, res) {
    try {
      const { 
        archiveType, 
        periodStart, 
        periodEnd 
      } = req.body;

      // Validation des paramètres
      if (!archiveType || !periodStart || !periodEnd) {
        return res.status(400).json({ 
          message: 'Paramètres incomplets' 
        });
      }

      const archive = await analyticsCleanupService.createArchive(
        archiveType, 
        new Date(periodStart), 
        new Date(periodEnd)
      );

      res.status(201).json(archive);
    } catch (error) {
      logger.error('Erreur lors de la création manuelle de l\'archive', error);
      res.status(500).json({ 
        message: 'Erreur lors de la création de l\'archive' 
      });
    }
  }

  // Supprimer une archive
  async deleteArchive(req, res) {
    try {
      const { archiveId } = req.params;

      const result = await AnalyticsArchive.findByIdAndDelete(archiveId);

      if (!result) {
        return res.status(404).json({ 
          message: 'Archive non trouvée' 
        });
      }

      logger.info('Archive supprimée', { archiveId });
      res.json({ 
        message: 'Archive supprimée avec succès' 
      });
    } catch (error) {
      logger.error('Erreur lors de la suppression de l\'archive', error);
      res.status(500).json({ 
        message: 'Erreur lors de la suppression de l\'archive' 
      });
    }
  }

  // Exporter une archive
  async exportArchive(req, res) {
    try {
      const { archiveId } = req.params;
      const { format = 'json' } = req.query;

      const archive = await AnalyticsArchive.findById(archiveId);

      if (!archive) {
        return res.status(404).json({ 
          message: 'Archive non trouvée' 
        });
      }

      switch (format) {
        case 'json':
          res.json(archive);
          break;
        case 'csv':
          // Conversion en CSV (simplifié)
          const csvData = archive.articleAnalytics.map(article => ({
            articleId: article.articleId,
            title: article.title,
            totalViews: article.totalEvents.view,
            totalLikes: article.totalEvents.like
          }));
          
          res.csv(csvData, `archive_${archiveId}.csv`);
          break;
        default:
          res.status(400).json({ 
            message: 'Format non supporté' 
          });
      }
    } catch (error) {
      logger.error('Erreur lors de l\'exportation de l\'archive', error);
      res.status(500).json({ 
        message: 'Erreur lors de l\'exportation de l\'archive' 
      });
    }
  }

  // Statistiques globales des archives
  async getArchiveStats(req, res) {
    try {
      const stats = await AnalyticsArchive.aggregate([
        {
          $group: {
            _id: '$archiveType',
            totalArchives: { $sum: 1 },
            totalArticles: { $sum: '$globalStats.totalArticles' },
            totalEvents: {
              view: { $sum: '$globalStats.totalEvents.view' },
              like: { $sum: '$globalStats.totalEvents.like' },
              comment: { $sum: '$globalStats.totalEvents.comment' },
              share: { $sum: '$globalStats.totalEvents.share' }
            }
          }
        }
      ]);

      res.json(stats);
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques globales', error);
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des statistiques' 
      });
    }
  }

  // Nouvelle méthode : Génération de rapports personnalisés
  async generateCustomReport(req, res) {
    try {
      const { 
        reportType = 'engagement', 
        startDate, 
        endDate,
        articleIds,
        groupBy = 'daily'
      } = req.query;

      // Validation des paramètres
      if (!startDate || !endDate) {
        return res.status(400).json({ 
          message: 'Dates de début et de fin requises' 
        });
      }

      let report;
      switch (reportType) {
        case 'engagement':
          report = await this.generateEngagementReport(
            new Date(startDate), 
            new Date(endDate), 
            articleIds ? articleIds.split(',') : null,
            groupBy
          );
          break;
        
        case 'readTime':
          report = await this.generateReadTimeReport(
            new Date(startDate), 
            new Date(endDate), 
            articleIds ? articleIds.split(',') : null,
            groupBy
          );
          break;
        
        case 'topPerforming':
          report = await this.generateTopPerformingReport(
            new Date(startDate), 
            new Date(endDate)
          );
          break;
        
        default:
          return res.status(400).json({ 
            message: 'Type de rapport non supporté' 
          });
      }

      res.json(report);
    } catch (error) {
      logger.error('Erreur lors de la génération du rapport', error);
      res.status(500).json({ 
        message: 'Erreur lors de la génération du rapport' 
      });
    }
  }

  // Rapport d'engagement
  async generateEngagementReport(startDate, endDate, articleIds = null, groupBy = 'daily') {
    const matchStage = {
      eventTimestamp: { 
        $gte: startDate, 
        $lte: endDate 
      }
    };

    if (articleIds) {
      matchStage.articleId = { $in: articleIds };
    }

    const groupStage = {
      daily: {
        $dateToString: { 
          format: '%Y-%m-%d', 
          date: '$eventTimestamp' 
        }
      },
      weekly: {
        $dateToString: { 
          format: '%Y-W%V', 
          date: '$eventTimestamp' 
        }
      },
      monthly: {
        $dateToString: { 
          format: '%Y-%m', 
          date: '$eventTimestamp' 
        }
      }
    }[groupBy];

    const report = await ArticleAnalytics.aggregate([
      { $match: matchStage },
      { 
        $group: {
          _id: groupStage,
          totalViews: { $sum: '$events.view' },
          totalLikes: { $sum: '$events.like' },
          totalComments: { $sum: '$events.comment' },
          uniqueArticles: { $addToSet: '$articleId' }
        }
      },
      { 
        $project: {
          _id: 1,
          totalViews: 1,
          totalLikes: 1,
          totalComments: 1,
          uniqueArticlesCount: { $size: '$uniqueArticles' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return report;
  }

  // Rapport de temps de lecture
  async generateReadTimeReport(startDate, endDate, articleIds = null, groupBy = 'daily') {
    const matchStage = {
      eventTimestamp: { 
        $gte: startDate, 
        $lte: endDate 
      }
    };

    if (articleIds) {
      matchStage.articleId = { $in: articleIds };
    }

    const groupStage = {
      daily: {
        $dateToString: { 
          format: '%Y-%m-%d', 
          date: '$eventTimestamp' 
        }
      },
      weekly: {
        $dateToString: { 
          format: '%Y-W%V', 
          date: '$eventTimestamp' 
        }
      },
      monthly: {
        $dateToString: { 
          format: '%Y-%m', 
          date: '$eventTimestamp' 
        }
      }
    }[groupBy];

    const report = await ArticleAnalytics.aggregate([
      { $match: matchStage },
      { 
        $group: {
          _id: groupStage,
          averageReadTime: { $avg: '$readTime' },
          totalReadTime: { $sum: '$readTime' },
          uniqueArticles: { $addToSet: '$articleId' }
        }
      },
      { 
        $project: {
          _id: 1,
          averageReadTime: 1,
          totalReadTime: 1,
          uniqueArticlesCount: { $size: '$uniqueArticles' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return report;
  }

  // Rapport des articles les plus performants
  async generateTopPerformingReport(startDate, endDate) {
    const report = await ArticleAnalytics.aggregate([
      { 
        $match: { 
          eventTimestamp: { 
            $gte: startDate, 
            $lte: endDate 
          } 
        } 
      },
      { 
        $group: {
          _id: '$articleId',
          totalViews: { $sum: '$events.view' },
          totalLikes: { $sum: '$events.like' },
          totalComments: { $sum: '$events.comment' },
          totalReadTime: { $sum: '$readTime' }
        }
      },
      { 
        $lookup: {
          from: 'articles', // Assurez-vous que c'est le bon nom de collection
          localField: '_id',
          foreignField: '_id',
          as: 'articleDetails'
        }
      },
      { $unwind: '$articleDetails' },
      { 
        $project: {
          title: '$articleDetails.title',
          totalViews: 1,
          totalLikes: 1,
          totalComments: 1,
          totalReadTime: 1,
          engagementScore: {
            $add: [
              { $multiply: ['$totalViews', 0.5] },
              { $multiply: ['$totalLikes', 2] },
              { $multiply: ['$totalComments', 3] },
              { $divide: ['$totalReadTime', 60] } // Convertir en minutes
            ]
          }
        }
      },
      { $sort: { engagementScore: -1 } },
      { $limit: 10 }
    ]);

    return report;
  }

  // Exportation du rapport
  async exportReport(req, res) {
    try {
      const { 
        reportType, 
        startDate, 
        endDate,
        format = 'json'
      } = req.query;

      const report = await this.generateCustomReport(req, res);

      switch (format) {
        case 'json':
          res.json(report);
          break;
        case 'csv':
          // Conversion en CSV (simplifié)
          const csvData = report.map(item => ({
            period: item._id,
            ...item
          }));
          
          res.csv(csvData, `report_${reportType}_${startDate}_${endDate}.csv`);
          break;
        default:
          res.status(400).json({ 
            message: 'Format non supporté' 
          });
      }
    } catch (error) {
      logger.error('Erreur lors de l\'exportation du rapport', error);
      res.status(500).json({ 
        message: 'Erreur lors de l\'exportation du rapport' 
      });
    }
  }
}

export default new AnalyticsArchiveController();
