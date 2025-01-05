import { apiClient, handleApiError } from './api';
import jwt_decode from 'jwt-decode';

interface TokenPayload {
    exp: number;
    [key: string]: any;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

export const authService = {
    login: async (email: string, password: string) => {
        try {
            const response = await apiClient.post('/users/login', { email, password });
            
            // Vérifier si l'utilisateur est un admin
            if (response.data.user.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            // Stocker le token et les infos utilisateur
            authService.setToken(response.data.token, response.data.user);

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
        return authService.isTokenValid();
    },

    isTokenValid: () => {
        const token = localStorage.getItem('admin_token');
        if (!token) return false;
        
        try {
            const decoded = jwt_decode<TokenPayload>(token);
            return decoded.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    },

    setToken: (token: string, user: User) => {
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(user));
    },

    getToken: () => {
        return localStorage.getItem('admin_token') || '';
    }
};

export default authService;