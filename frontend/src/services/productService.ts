import axios from 'axios';
import { cacheManager } from '../utils/cacheManager';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  specifications?: {
    height?: number;
    material?: string;
    color?: string;
  };
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/products';

export const fetchProducts = async (
  options: { 
    useCache?: boolean; 
    cacheKey?: string 
  } = {}
): Promise<Product[]> => {
  const { 
    useCache = true, 
    cacheKey = 'all_products' 
  } = options;

  // Vérifier le cache
  if (useCache) {
    const cachedProducts = cacheManager.get<Product[]>(cacheKey);
    if (cachedProducts) return cachedProducts;
  }

  try {
    const response = await axios.get(API_URL);
    const products = response.data;

    // Mettre en cache les produits
    cacheManager.set(cacheKey, products);

    return products;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits', error);
    // Ajout d'une gestion d'erreur plus robuste
    if (axios.isAxiosError(error)) {
      // Gestion spécifique des erreurs Axios
      if (error.response) {
        // La requête a été faite et le serveur a répondu avec un code d'état
        // qui sort de la plage de 2xx
        throw new Error(`Erreur serveur : ${error.response.status} - ${error.response.data}`);
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        throw new Error('Aucune réponse reçue du serveur');
      } else {
        // Quelque chose s'est passé lors de la configuration de la requête
        throw new Error('Erreur de configuration de la requête');
      }
    }
    
    // Gestion des erreurs génériques
    throw new Error('Erreur inattendue lors de la récupération des produits');
  }
};

export const fetchProductById = async (
  id: string, 
  options: { 
    useCache?: boolean 
  } = {}
): Promise<Product | null> => {
  const { useCache = true } = options;
  const cacheKey = `product_${id}`;

  // Vérifier le cache
  if (useCache) {
    const cachedProduct = cacheManager.get<Product>(cacheKey);
    if (cachedProduct) return cachedProduct;
  }

  try {
    const response = await axios.get(`${API_URL}/${id}`);
    const product = response.data;

    // Mettre en cache le produit
    cacheManager.set(cacheKey, product);

    return product;
  } catch (error) {
    console.error(`Erreur lors de la récupération du produit ${id}`, error);
    // Ajout d'une gestion d'erreur plus robuste
    if (axios.isAxiosError(error)) {
      // Gestion spécifique des erreurs Axios
      if (error.response) {
        // La requête a été faite et le serveur a répondu avec un code d'état
        // qui sort de la plage de 2xx
        throw new Error(`Erreur serveur : ${error.response.status} - ${error.response.data}`);
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        throw new Error('Aucune réponse reçue du serveur');
      } else {
        // Quelque chose s'est passé lors de la configuration de la requête
        throw new Error('Erreur de configuration de la requête');
      }
    }
    
    // Gestion des erreurs génériques
    throw new Error(`Erreur inattendue lors de la récupération du produit ${id}`);
  }
};

export const searchProducts = async (
  query: string, 
  options: { 
    useCache?: boolean 
  } = {}
): Promise<Product[]> => {
  const { useCache = true } = options;
  const cacheKey = `search_${query}`;

  // Vérifier le cache
  if (useCache) {
    const cachedResults = cacheManager.get<Product[]>(cacheKey);
    if (cachedResults) return cachedResults;
  }

  try {
    const response = await axios.get(`${API_URL}/search`, { 
      params: { query } 
    });
    const products = response.data;

    // Mettre en cache les résultats
    cacheManager.set(cacheKey, products);

    return products;
  } catch (error) {
    console.error('Erreur lors de la recherche de produits', error);
    // Ajout d'une gestion d'erreur plus robuste
    if (axios.isAxiosError(error)) {
      // Gestion spécifique des erreurs Axios
      if (error.response) {
        // La requête a été faite et le serveur a répondu avec un code d'état
        // qui sort de la plage de 2xx
        throw new Error(`Erreur serveur : ${error.response.status} - ${error.response.data}`);
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        throw new Error('Aucune réponse reçue du serveur');
      } else {
        // Quelque chose s'est passé lors de la configuration de la requête
        throw new Error('Erreur de configuration de la requête');
      }
    }
    
    // Gestion des erreurs génériques
    throw new Error('Erreur inattendue lors de la recherche de produits');
  }
};
