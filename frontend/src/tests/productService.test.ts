import axios from 'axios';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  fetchProducts 
} from '../services/productService';
import { cacheManager } from '../utils/cacheManager';

// Mock axios et cacheManager
vi.mock('axios');
vi.mock('../utils/cacheManager', () => ({
  cacheManager: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn()
  }
}));

describe('Product Service', () => {
  const mockProduct = {
    name: 'Test Chicha',
    description: 'Un produit de test',
    price: 99.99,
    category: 'chicha',
    stock: 10,
    imageUrl: 'http://test.com/image.jpg'
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('createProduct', () => {
    it('should create a new product successfully', async () => {
      // Simuler une réponse réussie de l'API
      (axios.post as any).mockResolvedValue({ 
        data: { 
          ...mockProduct, 
          id: 'test-product-id' 
        } 
      });

      const result = await createProduct(mockProduct);

      // Vérifications
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/products'), 
        mockProduct
      );
      expect(cacheManager.delete).toHaveBeenCalledWith('all_products');
      expect(result).toHaveProperty('id', 'test-product-id');
    });

    it('should handle creation error', async () => {
      // Simuler une erreur d'API
      (axios.post as any).mockRejectedValue(new Error('Création impossible'));

      await expect(createProduct(mockProduct)).rejects.toThrow('Erreur de réseau ou serveur');
    });
  });

  describe('updateProduct', () => {
    const productId = 'existing-product-id';
    const updateData = { name: 'Nouveau Nom' };

    it('should update an existing product', async () => {
      (axios.patch as any).mockResolvedValue({ 
        data: { 
          ...mockProduct, 
          id: productId,
          name: 'Nouveau Nom' 
        } 
      });

      const result = await updateProduct(productId, updateData);

      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/products/${productId}`), 
        updateData
      );
      expect(cacheManager.delete).toHaveBeenCalledWith('all_products');
      expect(cacheManager.delete).toHaveBeenCalledWith(`product_${productId}`);
      expect(result.name).toBe('Nouveau Nom');
    });
  });

  describe('deleteProduct', () => {
    const productId = 'product-to-delete';

    it('should delete a product successfully', async () => {
      (axios.delete as any).mockResolvedValue({});

      await deleteProduct(productId);

      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining(`/api/products/${productId}`)
      );
      expect(cacheManager.delete).toHaveBeenCalledWith('all_products');
      expect(cacheManager.delete).toHaveBeenCalledWith(`product_${productId}`);
    });
  });

  describe('fetchProducts', () => {
    it('should fetch products from cache if available', async () => {
      const cachedProducts = [mockProduct];
      (cacheManager.get as any).mockReturnValue(cachedProducts);

      const result = await fetchProducts();

      expect(cacheManager.get).toHaveBeenCalledWith('all_products');
      expect(result).toEqual(cachedProducts);
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('should fetch products from API if cache is empty', async () => {
      (cacheManager.get as any).mockReturnValue(null);
      (axios.get as any).mockResolvedValue({ data: [mockProduct] });

      const result = await fetchProducts();

      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/products'));
      expect(cacheManager.set).toHaveBeenCalledWith('all_products', [mockProduct]);
      expect(result).toEqual([mockProduct]);
    });
  });
});
