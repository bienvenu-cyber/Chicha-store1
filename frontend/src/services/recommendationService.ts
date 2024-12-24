import axios from 'axios';
import { Product } from './productService';

export interface UserPreference {
  categoryPreferences: Record<string, number>;
  lastViewedProducts: string[];
  purchaseHistory: string[];
}

export interface RecommendationContext {
  currentProductId?: string;
  currentCategory?: string;
}

class RecommendationService {
  private API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/recommendations';
  private STORAGE_KEY = 'user_preferences';

  // Récupérer ou initialiser les préférences utilisateur
  getUserPreferences(): UserPreference {
    const storedPreferences = localStorage.getItem(this.STORAGE_KEY);
    return storedPreferences 
      ? JSON.parse(storedPreferences) 
      : {
          categoryPreferences: {},
          lastViewedProducts: [],
          purchaseHistory: []
        };
  }

  // Mettre à jour les préférences utilisateur
  updateUserPreferences(update: Partial<UserPreference>) {
    const currentPreferences = this.getUserPreferences();
    const newPreferences = {
      ...currentPreferences,
      ...update
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newPreferences));
    return newPreferences;
  }

  // Enregistrer la vue d'un produit
  trackProductView(productId: string, category: string) {
    const preferences = this.getUserPreferences();

    // Mettre à jour les catégories
    preferences.categoryPreferences[category] = 
      (preferences.categoryPreferences[category] || 0) + 1;

    // Ajouter aux derniers produits vus (max 10)
    preferences.lastViewedProducts = [
      productId,
      ...preferences.lastViewedProducts.filter(id => id !== productId)
    ].slice(0, 10);

    this.updateUserPreferences(preferences);
  }

  // Enregistrer un achat
  trackPurchase(productIds: string[]) {
    const preferences = this.getUserPreferences();

    preferences.purchaseHistory.push(...productIds);

    this.updateUserPreferences(preferences);
  }

  // Obtenir des recommandations personnalisées
  async getPersonalizedRecommendations(
    context?: RecommendationContext
  ): Promise<Product[]> {
    try {
      const preferences = this.getUserPreferences();
      const response = await axios.post(`${this.API_URL}/personalized`, {
        preferences,
        context
      });

      return response.data;
    } catch (error) {
      console.error('Erreur de recommandation', error);
      return [];
    }
  }

  // Calculer la similarité entre produits
  async getRelatedProducts(productId: string): Promise<Product[]> {
    try {
      const response = await axios.get(`${this.API_URL}/related/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur de produits similaires', error);
      return [];
    }
  }

  // Recommandations basées sur l'historique de navigation
  async getBrowsingRecommendations(): Promise<Product[]> {
    try {
      const preferences = this.getUserPreferences();
      const response = await axios.post(`${this.API_URL}/browsing`, {
        lastViewedProducts: preferences.lastViewedProducts
      });

      return response.data;
    } catch (error) {
      console.error('Erreur de recommandation de navigation', error);
      return [];
    }
  }
}

export const recommendationService = new RecommendationService();
