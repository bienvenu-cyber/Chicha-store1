import { jest, describe, test, expect, beforeEach, afterEach } from "@jest/globals";
describe('Services Marketing', () => {
  let testUser;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Créer un utilisateur de test
    testUser = await User.create({
      email: 'test@chicha-store.com',
      name: 'Test User'
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Newsletter Service', () => {
    test('Inscription à la newsletter', async () => {
      const email = 'newsletter@test.com';
      const subscription = await NewsletterService.subscribeEmail(email);

      expect(subscription).toBeDefined();
      expect(subscription.email).toBe(email);
      expect(subscription.isActive).toBe(true);
    });

    test('Désabonnement', async () => {
      const email = 'unsubscribe@test.com';
      const subscription = await NewsletterService.subscribeEmail(email);
      
      await NewsletterService.unsubscribeEmail(subscription.unsubscribeToken);

      const updatedSubscription = await Newsletter.findById(subscription._id);
      expect(updatedSubscription.isActive).toBe(false);
    });
  });

  describe('Loyalty Service', () => {
    test('Initialisation du programme de fidélité', async () => {
      const loyaltyProgram = await LoyaltyService.initializeLoyaltyProgram(testUser._id);

      expect(loyaltyProgram).toBeDefined();
      expect(loyaltyProgram.points).toBe(50);
      expect(loyaltyProgram.tierLevel).toBe('bronze');
    });

    test('Ajout de points par achat', async () => {
      const orderTotal = 150;
      const loyaltyProgram = await LoyaltyService.addPointsFromPurchase(testUser._id, orderTotal);

      expect(loyaltyProgram.points).toBe(200); // 50 initiaux + 150 de l'achat
      expect(loyaltyProgram.tierLevel).toBe('silver');
    });

    test('Récupération de récompense', async () => {
      const loyaltyProgram = await LoyaltyService.claimReward(testUser._id, 'DISCOUNT_10');

      expect(loyaltyProgram.rewards).toHaveLength(1);
      expect(loyaltyProgram.rewards[0].name).toBe('Réduction 10%');
    });
  });

  describe('Remarketing Service', () => {
    test('Suivi de panier abandonné', async () => {
      const cartItems = [
        { 
          productId: mongoose.Types.ObjectId(), 
          quantity: 1, 
          price: 100 
        }
      ];

      const campaign = await RemarketingService.trackAbandonedCart(testUser._id, cartItems);

      expect(campaign).toBeDefined();
      expect(campaign.abandonedCartItems).toHaveLength(1);
      expect(campaign.status).toBe('pending');
    });

    test('Envoi d\'email de remarketing', async () => {
      const campaign = await RemarketingService.sendAbandonedCartEmail(testUser._id);

      expect(campaign).toBeDefined();
      expect(campaign.status).toBe('sent');
    });
  });
});
