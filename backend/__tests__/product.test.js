const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Product = require('../models/Product');
const { setupTestDatabase, teardownTestDatabase } = require('./testUtils');

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
          price: 15.99, 
          category: 'Test Category' 
        }
      ]);

      const res = await request(app).get('/api/products');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('price');
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
