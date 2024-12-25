require('dotenv').config();

export default {
  // Configuration des services d'innovation
  innovations: {
    augmentedReality: {
      enabled: true,
      modelPath: '/assets/ar-models',
      maxModels: 10
    },
    aiRecommendation: {
      enabled: true,
      confidenceThreshold: 0.7,
      trainingFrequency: 'weekly'
    },
    behavioralAI: {
      enabled: true,
      privacyMode: true,
      dataRetentionDays: 90
    },
    communityEngagement: {
      enabled: true,
      challengeTypes: [
        'flavor_explorer', 
        'mix_master', 
        'exotic_blend'
      ],
      maxActiveChallenges: 3
    },
    mixCreationGame: {
      enabled: true,
      difficultyLevels: ['easy', 'medium', 'hard'],
      rewardMultipliers: {
        'bronze': 1,
        'silver': 1.5,
        'gold': 2,
        'platinum': 3
      }
    }
  },

  // Configuration de la base de données
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/chichastore',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      }
    }
  },

  // Configuration du serveur
  server: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development'
  },

  // Configuration des services externes
  externalServices: {
    tensorflowjs: {
      backend: 'webgl',
      enableWebAssembly: true
    },
    cloudStorage: {
      provider: 'aws',
      bucket: process.env.AWS_S3_BUCKET
    }
  },

  // Configuration de sécurité
  security: {
    rateLimiting: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limite 100 requêtes par fenêtre
    },
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  },

  // Logging et monitoring
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    sensitiveFields: ['password', 'token']
  }
};
