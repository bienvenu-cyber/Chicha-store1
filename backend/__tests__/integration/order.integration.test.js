import { jest, describe, test, expect, beforeEach, afterEach } from "@jest/globals";import User from '../../models/User.js.js.js.js';
import Order from '../../models/Order.js.js.js.js';
import { setupTestDatabase, teardownTestDatabase } from '../testUtils.js.js.js.js';

describe('Order Integration Tests', () => {
  let testUser, testProduct, authToken;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    // Clear collections
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    // Create test user
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpassword123',
      role: 'user'
    });

    // Create test product
    testProduct = await Product.create({
      name: 'Test Chicha',
      description: 'Test Chicha Description',
      price: 49.99,
      category: 'Chicha'
    });

    // Generate auth token
    authToken = testUser.generateAuthToken();
  });

  describe('POST /api/orders', () => {
    it('should create a new order', async () => {
      const orderData = {
        products: [
          { 
            product: testProduct._id, 
            quantity: 2 
          }
        ],
        totalAmount: testProduct.price * 2,
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          country: 'Test Country'
        }
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        products: expect.any(Array),
        totalAmount: orderData.totalAmount
      });

      // Verify order in database
      const savedOrder = await Order.findById(res.body._id);
      expect(savedOrder).not.toBeNull();
    });

    it('should handle invalid order creation', async () => {
      const invalidOrderData = {
        // Missing required fields
        products: []
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidOrderData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
