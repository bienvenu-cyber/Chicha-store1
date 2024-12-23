const tf = require('@tensorflow/tfjs-node');
const mongoose = require('mongoose');
const ChichaMix = require('../models/ChichaMix');
const User = require('../models/User');

class AIRecommendationEngine {
  constructor() {
    this.model = null;
    this.initializeDeepLearningModel();
  }

  async initializeDeepLearningModel() {
    // Modèle de recommandation neuronal avancé
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [100],  // Vecteur de features utilisateur
          units: 128,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 32,
          activation: 'softmax'
        })
      ]
    });

    this.model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
  }

  async preprocessUserData(user) {
    // Extraction de features comportementales avancées
    const userHistory = await ChichaMix.find({ 
      user: user._id, 
      likes: { $gt: 3 } 
    }).populate('flavors');

    const behaviorVector = [
      // Données démographiques
      user.age || 0,
      user.gender === 'male' ? 1 : 0,
      user.location ? this.encodeLocation(user.location) : 0,

      // Comportement d'achat
      userHistory.reduce((sum, mix) => sum + mix.likes, 0),
      userHistory.length,

      // Préférences de saveurs
      ...this.encodeFlavors(user.preferredFlavors),

      // Comportement temporel
      this.calculateTimeActivityScore(userHistory),

      // Données sociales et communautaires
      user.communityRank || 0,
      user.socialInteractions || 0
    ];

    // Compléter ou tronquer le vecteur à 100 dimensions
    return tf.tensor2d([this.normalizeVector(behaviorVector, 100)], [1, 100]);
  }

  normalizeVector(vector, targetLength) {
    if (vector.length > targetLength) {
      return vector.slice(0, targetLength);
    }
    while (vector.length < targetLength) {
      vector.push(0);
    }
    return vector;
  }

  encodeLocation(location) {
    const locationMap = {
      'urban': 1.0,
      'suburban': 0.7,
      'rural': 0.3
    };
    return locationMap[location] || 0.5;
  }

  encodeFlavors(flavors) {
    const allFlavors = ['menthe', 'fruits', 'classic', 'exotique', 'intense'];
    return allFlavors.map(flavor => 
      flavors.includes(flavor) ? 1 : 0
    );
  }

  calculateTimeActivityScore(history) {
    const now = new Date();
    return history.reduce((score, mix) => {
      const daysSinceCreation = (now - mix.createdAt) / (1000 * 60 * 60 * 24);
      return score + (mix.likes / (daysSinceCreation + 1));
    }, 0);
  }

  async trainModel(users) {
    const trainingData = await Promise.all(
      users.map(async user => ({
        input: await this.preprocessUserData(user),
        output: this.generateRecommendationTarget(user)
      }))
    );

    const xs = tf.stack(trainingData.map(data => data.input));
    const ys = tf.stack(trainingData.map(data => data.output));

    await this.model.fit(xs, ys, {
      epochs: 100,
      batchSize: 32
    });
  }

  generateRecommendationTarget(user) {
    // Génération de cible de recommandation basée sur les préférences
    const targetVector = new Array(32).fill(0);
    // Logique de génération basée sur les préférences
    return tf.tensor1d(targetVector);
  }

  async getPersonalizedRecommendations(userId, k = 5) {
    const user = await User.findById(userId);
    const userVector = await this.preprocessUserData(user);

    const recommendations = this.model.predict(userVector);
    
    // Conversion des recommandations en mélanges
    const recommendedMixes = await this.convertRecommendationsToMixes(recommendations, k);

    return {
      personalizedMixes: recommendedMixes,
      recommendationConfidence: this.calculateRecommendationConfidence(recommendations)
    };
  }

  async convertRecommendationsToMixes(recommendations, k) {
    const topKIndices = recommendations.topk(k);
    
    return Promise.all(
      topKIndices.map(async index => {
        const mix = await ChichaMix.findOne().skip(index).limit(1);
        return mix;
      })
    );
  }

  calculateRecommendationConfidence(recommendations) {
    return recommendations.max().dataSync()[0];
  }

  // Recommandations contextuelles en temps réel
  async contextualRecommendations(currentMix, userContext) {
    const similarMixes = await ChichaMix.find({
      $or: [
        { flavors: { $in: currentMix.flavors } },
        { tags: { $in: currentMix.tags } }
      ],
      _id: { $ne: currentMix._id }
    })
    .sort({ likes: -1 })
    .limit(5);

    return similarMixes.filter(mix => 
      this.matchesUserContext(mix, userContext)
    );
  }

  matchesUserContext(mix, context) {
    // Logique de correspondance contextuelle avancée
    return true; // Implémentation à personnaliser
  }
}

module.exports = new AIRecommendationEngine();
