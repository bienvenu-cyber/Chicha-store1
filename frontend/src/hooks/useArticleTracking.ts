import { useEffect, useRef } from 'react';
import { 
  trackPageView, 
  trackReadTime, 
  trackArticleShare 
} from '../services/articleAnalyticsService';

export const useArticleTracking = (articleId: string) => {
  const startTimeRef = useRef<number | null>(null);

  // Tracking de la vue de page
  useEffect(() => {
    trackPageView(articleId);
    
    // Début du tracking du temps de lecture
    startTimeRef.current = Date.now();

    // Nettoyage et tracking du temps de lecture à la sortie
    return () => {
      if (startTimeRef.current) {
        const readDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
        trackReadTime(articleId, readDuration);
      }
    };
  }, [articleId]);

  // Fonctions de tracking pour les partages
  const trackShare = (platform: Parameters<typeof trackArticleShare>[1]) => {
    trackArticleShare(articleId, platform);
  };

  return {
    trackShare
  };
};

// Hook pour le tracking global des interactions
export const useGlobalAnalytics = () => {
  const generateUniqueId = () => {
    // Générer ou récupérer un ID unique pour l'utilisateur
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userId', userId);
    }
    return userId;
  };

  useEffect(() => {
    // Tracking des événements globaux
    const trackPageNavigation = () => {
      const userId = generateUniqueId();
      // Vous pouvez ajouter des événements de tracking global ici
      console.log('Page navigated', { 
        path: window.location.pathname, 
        userId 
      });
    };

    window.addEventListener('popstate', trackPageNavigation);
    return () => {
      window.removeEventListener('popstate', trackPageNavigation);
    };
  }, []);

  return {
    getUserId: generateUniqueId
  };
};
