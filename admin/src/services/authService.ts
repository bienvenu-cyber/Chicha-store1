import { apiClient, handleApiError } from './api';

export const authService = {
    login: async (email: string, password: string) => {
        try {
            const response = await apiClient.post('/users/login', { email, password });
            
            // Vérifier si l'utilisateur est un admin
            if (response.data.user.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            // Stocker le token et les infos utilisateur
            localStorage.setItem('admin_token', response.data.token);
            localStorage.setItem('admin_user', JSON.stringify(response.data.user));

            return response.data.user;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    logout: () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('admin_user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('admin_token');
    }
};

// Ajoutez ces fonctions au service
const TOKEN_EXPIRY = 3600; // 1 heure

export const authService = {
    // ... autres méthodes existantes ...
    
    isTokenValid: () => {
        const token = localStorage.getItem('admin_token');
        if (!token) return false;
        
        try {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            return tokenData.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    },

    login: async (email: string, password: string) => {
        try {
            const response = await apiClient.post('/users/login', { email, password });
            
            if (response.data.user.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            if (!response.data.token) {
                throw new Error('Token manquant dans la réponse');
            }

            localStorage.setItem('admin_token', response.data.token);
            localStorage.setItem('admin_user', JSON.stringify(response.data.user));

            return response.data.user;
        } catch (error) {
            throw handleApiError(error);
        }
    }
};