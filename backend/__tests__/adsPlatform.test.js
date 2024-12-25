import { jest, describe, test, expect, beforeEach, afterEach } from "@jest/globals";
describe('Intégration Plateformes Publicitaires', () => {
  let testUser;
  let testProduct;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Créer un utilisateur de test
    testUser = await User.create({
      email: 'ads_test@chicha-store.com',
      name: 'Test User'
    });

    // Créer un produit de test
    testProduct = await Product.create({
      name: 'Chicha Test',
      price: 150,
      category: 'Chichas'
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Création d\'Audiences', () => {
    test('Création d\'audience de remarketing', async () => {
      const audiences = await AdsPlatformService.createRemarketingAudience(testUser);

      expect(audiences).toBeDefined();
      expect(audiences.google).toBeDefined();
      expect(audiences.facebook).toBeDefined();
      expect(audiences.google.id).toBeTruthy();
      expect(audiences.facebook.id).toBeTruthy();
    });
  });

  describe('Création de Campagnes', () => {
    test('Création de campagne de remarketing', async () => {
      const productData = {
        ...testProduct.toObject(),
        googleAudienceId: 'test_google_audience',
        facebookAudienceId: 'test_facebook_audience'
      };

      const campaigns = await AdsPlatformService.createRemarkentingCampaign(productData);

      expect(campaigns).toBeDefined();
      expect(campaigns.google).toBeDefined();
      expect(campaigns.facebook).toBeDefined();
      expect(campaigns.google.id).toBeTruthy();
      expect(campaigns.facebook.id).toBeTruthy();
    });
  });

  describe('Suivi de Conversions', () => {
    test('Suivi de conversion d\'une commande', async () => {
      const conversionData = {
        orderId: mongoose.Types.ObjectId(),
        totalAmount: 300,
        products: [testProduct._id]
      };

      await expect(
        AdsPlatformService.trackConversion(conversionData)
      ).resolves.not.toThrow();
    });
  });
});
