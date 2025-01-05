import axios from 'axios';
import { AuthService } from './authService';

// Types pour les archives
export interface ArchiveStats {
  _id: string;
  totalArchives: number;
  totalArticles: number;
  totalEvents: {
    view: number;
    like: number;
    comment: number;
    share: number;
  };
}

export interface ArchiveSummary {
  _id: string;
  archiveType: 'daily' | 'weekly' | 'monthly';
  periodStart: string;
  periodEnd: string;
  globalStats: {
    totalArticles: number;
    totalEvents: {
      view: number;
      like: number;
      comment: number;
      share: number;
    };
  };
  createdAt: string;
}

export interface ArchiveDetails extends ArchiveSummary {
  articleAnalytics: Array<{
    articleId: string;
    title: string;
    totalEvents: {
      view: number;
      like: number;
      comment: number;
      share: number;
    };
  }>;
}

export interface ArchivePaginationResponse {
  archives: ArchiveSummary[];
  totalPages: number;
  currentPage: number;
  totalArchives: number;
}

// Nouveaux types pour les rapports
export interface EngagementReportItem {
  _id: string;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  uniqueArticlesCount: number;
}

export interface ReadTimeReportItem {
  _id: string;
  averageReadTime: number;
  totalReadTime: number;
  uniqueArticlesCount: number;
}

export interface TopPerformingArticle {
  title: string;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalReadTime: number;
  engagementScore: number;
}

export class AnalyticsArchiveService {
  private static BASE_URL = `${process.env.REACT_APP_API_URL}/analytics-archives`;

  // Récupérer la liste des archives
  static async listArchives(params: {
    page?: number;
    limit?: number;
    archiveType?: 'daily' | 'weekly' | 'monthly';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ArchivePaginationResponse> {
    try {
      const response = await axios.get(this.BASE_URL, {
        params,
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erreur lors de la récupération des archives');
      throw error;
    }
  }

  // Récupérer les détails d'une archive
  static async getArchiveDetails(archiveId: string): Promise<ArchiveDetails> {
    try {
      const response = await axios.get(`${this.BASE_URL}/${archiveId}`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erreur lors de la récupération des détails de l\'archive');
      throw error;
    }
  }

  // Créer une archive manuellement
  static async createManualArchive(data: {
    archiveType: 'daily' | 'weekly' | 'monthly';
    periodStart: string;
    periodEnd: string;
  }): Promise<ArchiveDetails> {
    try {
      const response = await axios.post(this.BASE_URL, data, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erreur lors de la création de l\'archive');
      throw error;
    }
  }

  // Supprimer une archive
  static async deleteArchive(archiveId: string): Promise<void> {
    try {
      await axios.delete(`${this.BASE_URL}/${archiveId}`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });
    } catch (error) {
      this.handleError(error, 'Erreur lors de la suppression de l\'archive');
      throw error;
    }
  }

  // Exporter une archive
  static async exportArchive(
    archiveId: string, 
    format: 'json' | 'csv' = 'json'
  ): Promise<Blob> {
    try {
      const response = await axios.get(`${this.BASE_URL}/${archiveId}/export`, {
        params: { format },
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erreur lors de l\'exportation de l\'archive');
      throw error;
    }
  }

  // Récupérer les statistiques globales
  static async getArchiveStats(): Promise<ArchiveStats[]> {
    try {
      const response = await axios.get(`${this.BASE_URL}/stats`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erreur lors de la récupération des statistiques');
      throw error;
    }
  }

  // Génération de rapports personnalisés
  static async generateCustomReport(params: {
    reportType: 'engagement' | 'readTime' | 'topPerforming';
    startDate: string;
    endDate: string;
    articleIds?: string[];
    groupBy?: 'daily' | 'weekly' | 'monthly';
  }): Promise<EngagementReportItem[] | ReadTimeReportItem[] | TopPerformingArticle[]> {
    try {
      const response = await axios.get(`${this.BASE_URL}/reports/custom`, {
        params: {
          ...params,
          articleIds: params.articleIds?.join(',')
        },
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erreur lors de la génération du rapport');
      throw error;
    }
  }

  // Exportation de rapports
  static async exportReport(params: {
    reportType: 'engagement' | 'readTime' | 'topPerforming';
    startDate: string;
    endDate: string;
    format?: 'json' | 'csv';
  }): Promise<Blob> {
    try {
      const response = await axios.get(`${this.BASE_URL}/reports/export`, {
        params,
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erreur lors de l\'exportation du rapport');
      throw error;
    }
  }

  // Méthode d'aide pour filtrer les archives
  static async listArchivesWithAdvancedFilters(params: {
    page?: number;
    limit?: number;
    archiveType?: 'daily' | 'weekly' | 'monthly';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    minArticles?: number;
    maxArticles?: number;
    startDate?: string;
    endDate?: string;
    minTotalEvents?: number;
    maxTotalEvents?: number;
  } = {}): Promise<ArchivePaginationResponse> {
    try {
      const response = await axios.get(this.BASE_URL, {
        params,
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erreur lors de la récupération des archives');
      throw error;
    }
  }

  // Gestion des erreurs
  private static handleError(error: any, defaultMessage: string) {
    if (axios.isAxiosError(error)) {
      console.error(
        error.response?.data?.message || 
        error.message || 
        defaultMessage
      );
    } else {
      console.error(defaultMessage);
    }
  }
}
