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
