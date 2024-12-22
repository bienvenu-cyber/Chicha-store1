import { useState, useEffect } from 'react';
import { 
  recommendationService, 
  RecommendationContext 
} from '../services/recommendationService';
import { Product } from '../services/productService';
import { useNotification } from '../contexts/NotificationContext';

export const useRecommendations = (context?: RecommendationContext) => {
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<Product[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [browsingRecommendations, setBrowsingRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const [personalized, related, browsing] = await Promise.all([
        recommendationService.getPersonalizedRecommendations(context),
        context?.currentProductId 
          ? recommendationService.getRelatedProducts(context.currentProductId)
          : Promise.resolve([]),
        recommendationService.getBrowsingRecommendations()
      ]);

      setPersonalizedRecommendations(personalized);
      setRelatedProducts(related);
      setBrowsingRecommendations(browsing);
    } catch (error) {
      showNotification('Erreur de chargement des recommandations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [
    context?.currentProductId, 
    context?.currentCategory
  ]);

  const trackProductView = (productId: string, category: string) => {
    recommendationService.trackProductView(productId, category);
  };

  const trackPurchase = (productIds: string[]) => {
    recommendationService.trackPurchase(productIds);
  };

  return {
    personalizedRecommendations,
    relatedProducts,
    browsingRecommendations,
    loading,
    trackProductView,
    trackPurchase,
    refetch: fetchRecommendations
  };
};
