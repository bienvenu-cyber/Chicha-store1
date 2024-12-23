const mongoose = require('mongoose');
const Redis = require('ioredis');
const { createClient } = require('redis');

class PerformanceOptimizer {
  constructor() {
    // Configuration MongoDB
    mongoose.set('debug', process.env.NODE_ENV === 'development');
    mongoose.set('autoIndex', process.env.NODE_ENV === 'development');

    // Configuration Redis pour le cache
    this.redisCache = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD
    });

    // Configuration Redis pour les limites de requêtes
    this.redisRateLimiter = createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD
    });
  }

  // Mise en cache des requêtes fréquentes
  async cacheQuery(key, query, options = {}) {
    const { 
      ttl = 3600,  // 1 heure par défaut
      forceRefresh = false 
    } = options;

    if (!forceRefresh) {
      const cachedResult = await this.redisCache.get(key);
      if (cachedResult) {
        return JSON.parse(cachedResult);
      }
    }

    const result = await query();

    // Stocker le résultat dans le cache
    await this.redisCache.set(
      key, 
      JSON.stringify(result), 
      'EX', 
      ttl
    );

    return result;
  }

  // Limitation des requêtes
  async rateLimit(key, limit = 100, window = 3600) {
    const current = await this.redisRateLimiter.incr(key);
    
    if (current === 1) {
      await this.redisRateLimiter.expire(key, window);
    }

    return current <= limit;
  }

  // Optimisation des requêtes MongoDB
  configureMongoIndexes() {
    // Exemple de configuration d'index pour différents modèles
    const models = [
      { 
        name: 'ChichaMix', 
        indexes: [
          { user: 1, createdAt: -1 },
          { isPublic: 1, likes: -1 }
        ]
      },
      {
        name: 'Subscription', 
        indexes: [
          { user: 1, status: 1 },
          { nextDeliveryDate: 1 }
        ]
      }
    ];

    models.forEach(async (modelConfig) => {
      const Model = mongoose.model(modelConfig.name);
      
      modelConfig.indexes.forEach(index => {
        Model.createIndexes(index);
      });
    });
  }

  // Surveillance des performances
  setupPerformanceMonitoring() {
    mongoose.plugin(schema => {
      schema.pre('find', function() {
        this.startTime = Date.now();
      });

      schema.post('find', function(docs) {
        const duration = Date.now() - this.startTime;
        
        if (duration > 500) {  // Requêtes de plus de 500ms
          console.warn(`Slow query detected: ${this.mongooseCollection.name}`, {
            duration,
            query: this.getQuery()
          });
        }
      });
    });
  }

  // Optimisation du chargement des données
  async batchLoad(model, ids, populateFields = []) {
    return model.find({ _id: { $in: ids } })
      .populate(populateFields)
      .lean();
  }

  // Configuration des pools de connexion
  configureConnectionPools() {
    mongoose.set('poolSize', 10);  // Nombre de connexions simultanées

    // Configuration du pool Redis
    this.redisCache.config('SET', 'maxmemory-policy', 'allkeys-lru');
    this.redisCache.config('SET', 'maxmemory', '2gb');
  }
}

module.exports = new PerformanceOptimizer();
