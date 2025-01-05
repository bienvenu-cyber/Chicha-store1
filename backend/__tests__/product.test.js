import { jest, describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { setupTestDatabase, teardownTestDatabase } from './testUtils.js';
import Product from '../src/models/Product.js';

describe('Product Routes', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await Product.deleteMany({});
  });

  describe('GET /api/products', () => {
    it('should return all products', async () => {
      // Create test products
      await Product.create([
        { 
          name: 'Test Product 1', 
          description: 'Test Description 1',
          price: 10.99,
          category: 'Test Category'
        },
        { 
          name: 'Test Product 2', 
          description: 'Test Description 2',
          price: 20.99,
          category: 'Test Category'
        }
      ]);

      // Perform the test
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.length).toBe(2);
      expect(response.body[0].name).toBe('Test Product 1');
      expect(response.body[1].name).toBe('Test Product 2');
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'New Test Product',
        description: 'New Test Description',
        price: 20.99,
        category: 'Test Category'
      };

      const res = await request(app)
        .post('/api/products')
        .send(newProduct);
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject(newProduct);
      
      // Verify product was saved in database
      const savedProduct = await Product.findOne({ name: 'New Test Product' });
      expect(savedProduct).not.toBeNull();
    });

    it('should handle invalid product creation', async () => {
      const invalidProduct = {
        // Missing required fields
        description: 'Incomplete Product'
      };

      const res = await request(app)
        .post('/api/products')
        .send(invalidProduct);
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
