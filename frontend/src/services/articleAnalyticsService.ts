import axios from 'axios';
import { cacheManager } from '../utils/cacheManager';

export interface ArticleAnalytics {
  articleId: string;
  views: number;
  uniqueViews: number;
  likes: number;
  comments: number;
  averageReadTime: number;
  shareCount: {
    facebook: number;
    twitter: number;
    linkedin: number;
    whatsapp: number;
    email: number;
  };
  topReferrers: Array<{
    source: string;
    visits: number;
  }>;
  engagement: {
    likeRate: number;
    commentRate: number;
    shareRate: number;
  };
  readTimeDistribution: Array<{
    range: string;
    percentage: number;
  }>;
}

export interface ArticleTrackingEvent {
  type: 'view' | 'like' | 'comment' | 'share';
  articleId: string;
  platform?: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'email';
  userId?: string;
  duration?: number;
}

const API_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/article-analytics` 
  : 'http://localhost:5000/api/article-analytics';

export const trackArticleEvent = async (event: ArticleTrackingEvent): Promise<void> => {
  try {
    await axios.post(`${API_URL}/track`, event);
  } catch (error) {
    console.error('Erreur lors du suivi de l\'événement', error);
  }
};

export const fetchArticleAnalytics = async (
  articleId: string, 
  options: { useCache?: boolean } = {}
): Promise<ArticleAnalytics> => {
  const { useCache = true } = options;
  const cacheKey = `article_analytics_${articleId}`;

  if (useCache) {
    const cachedAnalytics = cacheManager.get<ArticleAnalytics>(cacheKey);
    if (cachedAnalytics) return cachedAnalytics;
  }

  try {
    const response = await axios.get(`${API_URL}/${articleId}`);
    const analytics = response.data;

    cacheManager.set(cacheKey, analytics, 3600); // Cache 1 heure

    return analytics;
  } catch (error) {
    console.error(`Erreur lors de la récupération des analytics pour l'article ${articleId}`, error);
    throw new Error('Impossible de charger les analytics');
  }
};

export const fetchTopArticles = async (
  options: { 
    period?: 'daily' | 'weekly' | 'monthly';
    limit?: number;
  } = {}
): Promise<Array<ArticleAnalytics & { title: string }>> => {
  const { 
    period = 'weekly', 
    limit = 5 
  } = options;

  try {
    const response = await axios.get(`${API_URL}/top-articles`, {
      params: { period, limit }
    });

    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des articles les plus populaires', error);
    throw new Error('Impossible de charger les articles populaires');
  }
};

// Fonctions utilitaires pour le tracking côté client
export const trackPageView = (articleId: string) => {
  trackArticleEvent({
    type: 'view',
    articleId,
    userId: localStorage.getItem('userId') || undefined
  });
};

export const trackArticleShare = (
  articleId: string, 
  platform: ArticleTrackingEvent['platform']
) => {
  trackArticleEvent({
    type: 'share',
    articleId,
    platform,
    userId: localStorage.getItem('userId') || undefined
  });
};

export const trackReadTime = (articleId: string, duration: number) => {
  trackArticleEvent({
    type: 'view',
    articleId,
    duration,
    userId: localStorage.getItem('userId') || undefined
  });
};
