import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

export const ApiService = {
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits', error);
      throw error;
    }
  },

  async getProductById(id: number): Promise<Product> {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du produit ${id}`, error);
      throw error;
    }
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/category/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des produits de la catégorie ${category}`, error);
      throw error;
    }
  }
};
