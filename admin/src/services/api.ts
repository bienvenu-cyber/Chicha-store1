import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export const handleApiError = (error: any) => {
    if (error.response) {
        // La requête a été faite et le serveur a répondu avec un code d'état
        console.error('Erreur de réponse:', error.response.data);
        return error.response.data.message || 'Une erreur est survenue';
    } else if (error.request) {
        // La requête a été faite mais pas de réponse
        console.error('Pas de réponse:', error.request);
        return 'Pas de réponse du serveur';
    } else {
        // Quelque chose s\'est passé lors de la configuration de la requête
        console.error('Erreur:', error.message);
        return 'Erreur de configuration';
    }
};

import axios from 'axios';
import axiosRetry from 'axios-retry';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosRetry(apiClient, { 
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
               error.response?.status === 429;
    }
});