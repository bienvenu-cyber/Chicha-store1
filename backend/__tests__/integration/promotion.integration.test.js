import { jest, describe, test, expect, beforeEach, afterEach } from "@jest/globals";import Promotion from '../../models/Promotion.js.js.js.js';
import Product from '../../models/Product.js.js.js.js';
import { setupTestDatabase, teardownTestDatabase } from '../testUtils.js.js.js.js';

describe('Promotion Integration Tests', () => {
  let adminUser, regularUser, testProduct, authTokenAdmin, authTokenUser;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    // Clear collections
    await User.deleteMany({});
    await Promotion.deleteMany({});
    await Product.deleteMany({});

    // Create test product
    testProduct = await Product.create({
      name: 'Test Chicha',
      description: 'Test Chicha Description',
      price: 49.99,
      category: 'Chicha'
    });

    // Create admin user
    adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'adminpassword123',
      role: 'admin'
    });

    // Create regular user
    regularUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpassword123',
      role: 'user'
    });

    // Generate auth tokens
    authTokenAdmin = adminUser.generateAuthToken();
    authTokenUser = regularUser.generateAuthToken();
  });

  describe('Promotion CRUD Operations', () => {
    it('should create a promotion (admin only)', async () => {
      const promotionData = {
        code: 'TEST10',
        description: 'Test Promotion',
        discountType: 'percentage',
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        applicableProducts: [testProduct._id],
        minPurchaseAmount: 50
      };

      const res = await request(app)
        .post('/api/promotions')
        .set('Authorization', `Bearer ${authTokenAdmin}`)
        .send(promotionData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        code: 'TEST10',
        discountType: 'percentage',
        discountValue: 10
      });
    });

    it('should prevent non-admin from creating promotions', async () => {
      const promotionData = {
        code: 'TEST10',
        description: 'Test Promotion',
        discountType: 'percentage',
        discountValue: 10
      };

      const res = await request(app)
        .post('/api/promotions')
        .set('Authorization', `Bearer ${authTokenUser}`)
        .send(promotionData);

      expect(res.statusCode).toBe(403);
    });

    it('should apply promotion to order', async () => {
      // Create a promotion
      const promotion = await Promotion.create({
        code: 'TEST20',
        description: 'Test Promotion',
        discountType: 'percentage',
        discountValue: 20,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        applicableProducts: [testProduct._id],
        isActive: true
      });

      // Simulate order with promotion
      const orderData = {
        products: [
          { 
            product: testProduct._id, 
            quantity: 1 
          }
        ],
        promotionCode: 'TEST20',
        totalAmount: testProduct.price
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authTokenUser}`)
        .send(orderData);

      expect(res.statusCode).toBe(201);
      expect(res.body.totalAmount).toBeLessThan(testProduct.price);
    });
  });
});
