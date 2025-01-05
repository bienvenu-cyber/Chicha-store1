import { ArticleEvent } from '../models/ArticleAnalytics.js';
import AnalyticsArchive from '../models/AnalyticsArchive.js';
import logger from '../config/logger.js';
import cron from 'node-cron';

class AnalyticsCleanupService {
  // Archivage quotidien
  async archiveDaily() {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    try {
      await this.createArchive('daily', yesterday, now);
    } catch (error) {
      logger.error('Erreur lors de l\'archivage quotidien', error);
    }
  }

  // Archivage hebdomadaire
  async archiveWeekly() {
    const now = new Date();
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);
    lastWeek.setHours(0, 0, 0, 0);

    try {
      await this.createArchive('weekly', lastWeek, now);
    } catch (error) {
      logger.error('Erreur lors de l\'archivage hebdomadaire', error);
    }
  }

  // Archivage mensuel
  async archiveMonthly() {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    try {
      await this.createArchive('monthly', lastMonth, thisMonthStart);
    } catch (error) {
      logger.error('Erreur lors de l\'archivage mensuel', error);
    }
  }

  // Méthode générique de création d'archive
  async createArchive(archiveType, periodStart, periodEnd) {
    try {
      // Créer l'archive
      const archive = await AnalyticsArchive.createArchive(
        archiveType, 
        periodStart, 
        periodEnd
      );

      // Supprimer les événements archivés
      await ArticleEvent.deleteMany({
        timestamp: {
          $gte: periodStart,
          $lt: periodEnd
        }
      });

      logger.info(`Archive ${archiveType} créée avec succès`, {
        periodStart,
        periodEnd,
        articlesArchived: archive.articleAnalytics.length
      });

      return archive;
    } catch (error) {
      logger.error(`Erreur lors de la création de l'archive ${archiveType}`, error);
      throw error;
    }
  }

  // Nettoyage des événements anciens
  async cleanupOldEvents() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    try {
      const result = await ArticleEvent.deleteMany({
        timestamp: { $lt: sixMonthsAgo }
      });

      logger.info('Nettoyage des événements anciens', {
        deletedEvents: result.deletedCount
      });
    } catch (error) {
      logger.error('Erreur lors du nettoyage des événements', error);
    }
  }

  // Configuration des tâches planifiées
  setupScheduledTasks() {
    // Archivage quotidien à minuit
    cron.schedule('0 0 * * *', () => {
      this.archiveDaily();
    });

    // Archivage hebdomadaire le dimanche à minuit
    cron.schedule('0 0 * * 0', () => {
      this.archiveWeekly();
    });

    // Archivage mensuel le premier jour du mois à minuit
    cron.schedule('0 0 1 * *', () => {
      this.archiveMonthly();
    });

    // Nettoyage des événements tous les 3 mois
    cron.schedule('0 0 1 */3 *', () => {
      this.cleanupOldEvents();
    });
  }

  // Méthode de démarrage du service
  start() {
    logger.info('Démarrage du service de nettoyage des analytics');
    this.setupScheduledTasks();
  }
}

export default new AnalyticsCleanupService();
