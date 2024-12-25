import tf from '@tensorflow/tfjs-node';
import User from '../models/User.js.js';
import ChichaMix from '../models/ChichaMix.js.js';

export default class BehavioralAIService {
  constructor() {
    this.behaviorModel = null;
    this.initializeBehaviorModel();
  }

  initializeBehaviorModel() {
    this.behaviorModel = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [50],
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 16,
          activation: 'softmax'
        })
      ]
    });

    this.behaviorModel.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
  }

  async extractBehavioralFeatures(user) {
    const interactions = await this.getUserInteractions(user);
    
    return [
      // Données démographiques
      user.age || 0,
      user.gender === 'male' ? 1 : 0,
      
      // Comportement d'achat
      interactions.totalPurchases,
      interactions.averageSpending,
      
      // Préférences
      ...this.encodeFlavors(interactions.favoriteFlavors),
      
      // Engagement communautaire
      interactions.communityRank,
      interactions.socialInteractions,
      
      // Comportement temporel
      interactions.lastActivityDays,
      interactions.activityFrequency,
      
      // Données psychographiques
      interactions.riskTolerance,
      interactions.innovationLevel
    ];
  }

  async getUserInteractions(user) {
    const purchases = await ChichaMix.find({ user: user._id });
    const flavors = purchases.flatMap(p => p.flavors);

    return {
      totalPurchases: purchases.length,
      averageSpending: purchases.reduce((sum, p) => sum + p.price, 0) / purchases.length,
      favoriteFlavors: this.extractTopFlavors(flavors),
      communityRank: user.communityRank || 0,
      socialInteractions: user.socialInteractions || 0,
      lastActivityDays: this.calculateDaysSinceLastActivity(user),
      activityFrequency: this.calculateActivityFrequency(purchases),
      riskTolerance: this.calculateRiskTolerance(purchases),
      innovationLevel: this.calculateInnovationLevel(purchases)
    };
  }

  extractTopFlavors(flavors, topN = 5) {
    const flavorCounts = flavors.reduce((counts, flavor) => {
      counts[flavor] = (counts[flavor] || 0) + 1;
      return counts;
    }, {});

    return Object.entries(flavorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([flavor]) => flavor);
  }

  calculateDaysSinceLastActivity(user) {
    const now = new Date();
    const lastActivity = user.lastActivityAt || now;
    return (now - lastActivity) / (1000 * 60 * 60 * 24);
  }

  calculateActivityFrequency(purchases) {
    if (purchases.length <= 1) return 0;
    
    const timestamps = purchases.map(p => p.createdAt);
    const intervals = timestamps
      .slice(1)
      .map((time, i) => time - timestamps[i]);
    
    return intervals.reduce((a, b) => a + b, 0) / intervals.length;
  }

  calculateRiskTolerance(purchases) {
    const uniqueFlavors = new Set(purchases.flatMap(p => p.flavors));
    return uniqueFlavors.size / purchases.length;
  }

  calculateInnovationLevel(purchases) {
    const standardMixes = purchases.filter(p => p.isStandardMix);
    const customMixes = purchases.filter(p => !p.isStandardMix);
    
    return customMixes.length / purchases.length;
  }

  async predictPersonalizedExperience(user) {
    const features = await this.extractBehavioralFeatures(user);
    const featuresTensor = tf.tensor2d([features], [1, 50]);
    
    const prediction = this.behaviorModel.predict(featuresTensor);
    const personalizedScores = prediction.dataSync();

    return {
      preferredMixStyle: this.interpretPrediction(personalizedScores),
      recommendedInteractions: this.generateRecommendedInteractions(personalizedScores)
    };
  }

  interpretPrediction(scores) {
    const styles = [
      'traditionnel', 
      'innovant', 
      'expérimental', 
      'classique', 
      'audacieux'
    ];

    const maxIndex = scores.indexOf(Math.max(...scores));
    return styles[maxIndex];
  }

  generateRecommendedInteractions(scores) {
    const interactions = [
      { type: 'atelier_decouverte', score: scores[0] },
      { type: 'personnalisation_mix', score: scores[1] },
      { type: 'defi_creation', score: scores[2] },
      { type: 'communaute_echange', score: scores[3] }
    ];

    return interactions
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(interaction => interaction.type);
  }
}

export default new BehavioralAIService();
