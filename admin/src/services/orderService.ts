import { apiClient, handleApiError } from './api';
import { Order } from '../types/Order';

export const orderService = {
    // Récupérer toutes les commandes
    getAll: async (page = 1, limit = 10, filters = {}) => {
        try {
            const response = await apiClient.get('/orders', { 
                params: { page, limit, ...filters } 
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Récupérer une commande par ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/orders/${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Mettre à jour le statut d'une commande
    updateStatus: async (id: string, status: Order['status']) => {
        try {
            const response = await apiClient.patch(`/orders/${id}/status`, { status });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Générer un rapport de ventes
    getSalesReport: async (startDate: string, endDate: string) => {
        try {
            const response = await apiClient.get('/orders/sales-report', {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
};
