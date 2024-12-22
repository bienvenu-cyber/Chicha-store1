import { apiClient, handleApiError } from './api';
import { User } from '../types/User';

export const userService = {
    // Récupérer tous les utilisateurs
    getAll: async (page = 1, limit = 10, filters = {}) => {
        try {
            const response = await apiClient.get('/users', { 
                params: { page, limit, ...filters } 
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Récupérer un utilisateur par ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Créer un nouvel utilisateur
    create: async (userData: User) => {
        try {
            const response = await apiClient.post('/users', userData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Mettre à jour un utilisateur
    update: async (id: string, userData: Partial<User>) => {
        try {
            const response = await apiClient.put(`/users/${id}`, userData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Supprimer un utilisateur
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/users/${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Récupérer les commandes d'un utilisateur
    getUserOrders: async (id: string) => {
        try {
            const response = await apiClient.get(`/users/${id}/orders`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
};
