import { apiClient, handleApiError } from './api';
import { Product } from '../types/Product';

export const productService = {
    // Récupérer tous les produits
    getAll: async (page = 1, limit = 10, filters = {}) => {
        try {
            const response = await apiClient.get('/products', { 
                params: { page, limit, ...filters } 
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Récupérer un produit par ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Créer un nouveau produit
    create: async (productData: Product) => {
        try {
            const response = await apiClient.post('/products', productData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Mettre à jour un produit
    update: async (id: string, productData: Partial<Product>) => {
        try {
            const response = await apiClient.put(`/products/${id}`, productData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Supprimer un produit
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/products/${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Uploader une image
    uploadImage: async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await apiClient.post('/products/upload-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data.imageUrl;
        } catch (error) {
            throw handleApiError(error);
        }
    }
};
