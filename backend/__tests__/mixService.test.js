import { jest, describe, test, expect, beforeEach, afterEach } from "@jest/globals";
describe('MixService', () => {
  let testUser;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Créer un utilisateur de test
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com'
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await ChichaMix.deleteMany({});
    await mongoose.connection.close();
  });

  describe('createPersonalMix', () => {
    it('devrait créer un mélange personnalisé', async () => {
      const mixData = {
        name: 'Mon Mélange Unique',
        ingredients: [
          { name: 'Tabac Blond', category: 'Tabac', intensity: 7 },
          { name: 'Pomme', category: 'Fruit', intensity: 5 }
        ],
        isPublic: false
      };

      const mix = await MixService.createPersonalMix(testUser._id, mixData);

      expect(mix).toBeDefined();
      expect(mix.name).toBe('Mon Mélange Unique');
      expect(mix.totalIntensity).toBe(12);
      expect(mix.user.toString()).toBe(testUser._id.toString());
    });

    it('devrait calculer correctement l\'intensité totale', () => {
      const ingredients = [
        { name: 'Tabac', category: 'Tabac', intensity: 6 },
        { name: 'Menthe', category: 'Épice', intensity: 4 }
      ];

      const totalIntensity = MixService.calculateTotalIntensity(ingredients);
      expect(totalIntensity).toBe(10);
    });
  });

  describe('getUserMixes', () => {
    beforeEach(async () => {
      // Créer plusieurs mélanges pour le test
      await ChichaMix.create([
        { 
          user: testUser._id, 
          name: 'Mélange 1', 
          ingredients: [{ name: 'Tabac', category: 'Tabac', intensity: 5 }] 
        },
        { 
          user: testUser._id, 
          name: 'Mélange 2', 
          ingredients: [{ name: 'Fruit', category: 'Fruit', intensity: 7 }] 
        }
      ]);
    });

    it('devrait récupérer les mélanges d\'un utilisateur', async () => {
      const result = await MixService.getUserMixes(testUser._id);

      expect(result.mixes.length).toBe(2);
      expect(result.pagination.total).toBe(2);
    });
  });

  describe('getPublicMixes', () => {
    beforeEach(async () => {
      await ChichaMix.create([
        { 
          user: testUser._id, 
          name: 'Mélange Public 1', 
          isPublic: true,
          likes: 5,
          ingredients: [{ name: 'Tabac', category: 'Tabac', intensity: 5 }] 
        },
        { 
          user: testUser._id, 
          name: 'Mélange Public 2', 
          isPublic: true,
          likes: 10,
          ingredients: [{ name: 'Fruit', category: 'Fruit', intensity: 7 }] 
        }
      ]);
    });

    it('devrait récupérer les mélanges publics', async () => {
      const result = await MixService.getPublicMixes({ minLikes: 5 });

      expect(result.mixes.length).toBe(2);
      expect(result.pagination.total).toBe(2);
    });
  });

  describe('likeMix', () => {
    let mixToLike;

    beforeEach(async () => {
      mixToLike = await ChichaMix.create({
        user: testUser._id,
        name: 'Mélange à Liker',
        isPublic: true,
        ingredients: [{ name: 'Tabac', category: 'Tabac', intensity: 5 }]
      });
    });

    it('devrait ajouter un like à un mélange', async () => {
      const updatedMix = await MixService.likeMix(mixToLike._id, testUser._id);

      expect(updatedMix.likes).toContain(testUser._id);
    });

    it('devrait retirer un like existant', async () => {
      // Ajouter d\'abord un like
      await MixService.likeMix(mixToLike._id, testUser._id);
      
      // Puis retirer le like
      const updatedMix = await MixService.likeMix(mixToLike._id, testUser._id);

      expect(updatedMix.likes).not.toContain(testUser._id);
    });
  });
});
