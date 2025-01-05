import axios from 'axios';
import { cacheManager } from '../utils/cacheManager';

export interface Comment {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  userLiked?: boolean;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  publishedAt: string;
  imageUrl?: string;
  tags?: string[];
  category: 'chicha' | 'tabac' | 'lifestyle' | 'conseil';
  likes: number;
  userLiked?: boolean;
  comments?: Comment[];
}

const API_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/articles` 
  : 'http://localhost:5000/api/articles';

export const fetchArticles = async (
  options: { 
    useCache?: boolean; 
    cacheKey?: string 
  } = {}
): Promise<Article[]> => {
  const { 
    useCache = true, 
    cacheKey = 'all_articles' 
  } = options;

  if (useCache) {
    const cachedArticles = cacheManager.get<Article[]>(cacheKey);
    if (cachedArticles) return cachedArticles;
  }

  try {
    const response = await axios.get(API_URL);
    const articles = response.data;

    cacheManager.set(cacheKey, articles);

    return articles;
  } catch (error) {
    console.error('Erreur lors de la récupération des articles', error);
    throw new Error('Impossible de charger les articles');
  }
};

export const fetchArticleById = async (
  id: string, 
  options: { useCache?: boolean } = {}
): Promise<Article> => {
  const { useCache = true } = options;
  const cacheKey = `article_${id}`;

  if (useCache) {
    const cachedArticle = cacheManager.get<Article>(cacheKey);
    if (cachedArticle) return cachedArticle;
  }

  try {
    const response = await axios.get(`${API_URL}/${id}`);
    const article = response.data;

    cacheManager.set(cacheKey, article);

    return article;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'article ${id}`, error);
    throw new Error('Impossible de charger les détails de l\'article');
  }
};

export const createArticle = async (articleData: Omit<Article, 'id'>): Promise<Article> => {
  try {
    const response = await axios.post(API_URL, articleData);
    
    cacheManager.delete('all_articles');
    
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de l\'article', error);
    throw new Error('Impossible de créer l\'article');
  }
};

export const likeArticle = async (articleId: string): Promise<Article> => {
  try {
    const response = await axios.post(`${API_URL}/${articleId}/like`);
    
    cacheManager.delete(`article_${articleId}`);
    
    return response.data;
  } catch (error) {
    console.error(`Erreur lors du like de l'article ${articleId}`, error);
    throw new Error('Impossible de liker l\'article');
  }
};

export const addComment = async (
  articleId: string, 
  commentData: { content: string }
): Promise<Comment> => {
  try {
    const response = await axios.post(`${API_URL}/${articleId}/comments`, commentData);
    
    cacheManager.delete(`article_${articleId}`);
    
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de l'ajout d'un commentaire à l'article ${articleId}`, error);
    throw new Error('Impossible d\'ajouter un commentaire');
  }
};

export const likeComment = async (
  articleId: string, 
  commentId: string
): Promise<Comment> => {
  try {
    const response = await axios.post(`${API_URL}/${articleId}/comments/${commentId}/like`);
    
    cacheManager.delete(`article_${articleId}`);
    
    return response.data;
  } catch (error) {
    console.error(`Erreur lors du like du commentaire ${commentId}`, error);
    throw new Error('Impossible de liker le commentaire');
  }
};
