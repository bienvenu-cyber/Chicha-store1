import axios from 'axios';
import { monitoringService } from '../services/monitoringService';

const setupAxiosInterceptors = () => {
  // Intercepteur de requête
  axios.interceptors.request.use(
    async (config) => {
      const token = localStorage.getItem('token');
      
      // Ajouter le token d'authentification
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      // Horodatage du début de la requête
      config.metadata = { startTime: Date.now() };

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Intercepteur de réponse
  axios.interceptors.response.use(
    (response) => {
      // Mesurer la durée de la requête
      const duration = Date.now() - (response.config.metadata?.startTime || 0);
      
      monitoringService.reportPerformance({
        pageLoad: duration,
        apiCalls: [{
          url: response.config.url || '',
          duration
        }]
      });

      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Gestion du rafraîchissement de token
      if (
        error.response?.status === 401 && 
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          const response = await axios.post('/api/auth/refresh', { refreshToken });
          
          const { token, refreshToken: newRefreshToken } = response.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Réessayer la requête originale
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // Déconnexion si le refresh échoue
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          
          return Promise.reject(refreshError);
        }
      }

      // Tracking des erreurs
      monitoringService.trackUserActivity({
        type: 'error',
        details: {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url
        }
      });

      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;
