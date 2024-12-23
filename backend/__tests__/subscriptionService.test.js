const mongoose = require('mongoose');
const SubscriptionService = require('../services/subscriptionService');
const Subscription = require('../models/Subscription');
const Product = require('../models/Product');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    subscriptions: {
      create: jest.fn().mockResolvedValue({ id: 'mock_stripe_sub' }),
      del: jest.fn().mockResolvedValue({})
    }
  }));
});

describe('SubscriptionService', () => {
  let testUser;
  let testProduct;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Créer un utilisateur et un produit de test
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com'
    });

    testProduct = await Product.create({
      name: 'Chicha Premium',
      price: 150,
      stripePriceId: 'price_test123'
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Subscription.deleteMany({});
    await mongoose.connection.close();
  });

  describe('createSubscription', () => {
    it('devrait créer un abonnement', async () => {
      const subscriptionData = {
        product: testProduct._id,
        frequency: 'Trimestriel'
      };

      const subscription = await SubscriptionService.createSubscription(
        testUser._id, 
        subscriptionData
      );

      expect(subscription).toBeDefined();
      expect(subscription.product.toString()).toBe(testProduct._id.toString());
      expect(subscription.frequency).toBe('Trimestriel');
      expect(subscription.discount).toBe(10);
    });

    it('devrait gérer l\'erreur de produit inexistant', async () => {
      const invalidSubscriptionData = {
        product: mongoose.Types.ObjectId(),
        frequency: 'Mensuel'
      };

      await expect(
        SubscriptionService.createSubscription(testUser._id, invalidSubscriptionData)
      ).rejects.toThrow('Produit non trouvé');
    });
  });

  describe('calculateDiscount', () => {
    it('devrait calculer correctement les remises', () => {
      const service = SubscriptionService;

      expect(service.calculateDiscount('Mensuel')).toBe(0);
      expect(service.calculateDiscount('Trimestriel')).toBe(10);
      expect(service.calculateDiscount('Semestriel')).toBe(20);
    });
  });

  describe('getUserSubscriptions', () => {
    beforeEach(async () => {
      await Subscription.create([
        {
          user: testUser._id,
          product: testProduct._id,
          frequency: 'Mensuel',
          status: 'Actif'
        },
        {
          user: testUser._id,
          product: testProduct._id,
          frequency: 'Trimestriel',
          status: 'Actif'
        }
      ]);
    });

    it('devrait récupérer les abonnements actifs d\'un utilisateur', async () => {
      const subscriptions = await SubscriptionService.getUserSubscriptions(testUser._id);

      expect(subscriptions.length).toBe(2);
      expect(subscriptions[0].status).toBe('Actif');
    });
  });

  describe('cancelSubscription', () => {
    let subscriptionToCancel;

    beforeEach(async () => {
      subscriptionToCancel = await Subscription.create({
        user: testUser._id,
        product: testProduct._id,
        frequency: 'Mensuel',
        status: 'Actif',
        paymentMethod: 'sub_test123'
      });
    });

    it('devrait annuler un abonnement', async () => {
      const cancelledSubscription = await SubscriptionService.cancelSubscription(
        subscriptionToCancel._id, 
        testUser._id
      );

      expect(cancelledSubscription.status).toBe('Annulé');
    });

    it('devrait gérer l\'erreur d\'abonnement inexistant', async () => {
      await expect(
        SubscriptionService.cancelSubscription(
          mongoose.Types.ObjectId(), 
          testUser._id
        )
      ).rejects.toThrow('Abonnement non trouvé');
    });
  });
});
