import { performance } from 'perf_hooks';
import Redis from 'ioredis';

export default class APIPerformanceManager {
  constructor() {
    // Cache Redis pour optimisation
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    });

    // Configuration du cache
    this.cacheConfig = {
      ads: {
        ttl: 3600, // 1 heure
        prefix: 'ads_cache:'
      },
      remarketing: {
        ttl: 7200, // 2 heures
        prefix: 'remarketing_cache:'
      }
    };
  }

  // Mesure des performances d'appel API
  async measureAPIPerformance(apiCall, context = {}) {
    const start = performance.now();

    try {
      const result = await apiCall();
      const duration = performance.now() - start;

      this.logPerformance({
        ...context,
        duration,
        status: 'success'
      });

      return result;
    } catch (error) {
      const duration = performance.now() - start;

      this.logPerformance({
        ...context,
        duration,
        status: 'error',
        errorMessage: error.message
      });

      throw error;
    }
  }

  // Mise en cache des résultats d'API
  async cachedAPICall(key, apiCall, cacheType = 'ads') {
    const cacheKey = `${this.cacheConfig[cacheType].prefix}${key}`;

    // Vérifier le cache
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // Appel API et mise en cache
    const result = await this.measureAPIPerformance(apiCall, { cacheKey });

    await this.redis.set(
      cacheKey, 
      JSON.stringify(result), 
      'EX', 
      this.cacheConfig[cacheType].ttl
    );

    return result;
  }

  // Optimisation des requêtes parallèles
  async parallelAPICall(apiCalls) {
    return Promise.all(
      apiCalls.map(call => 
        this.measureAPIPerformance(call.fn, call.context)
      )
    );
  }

  // Journalisation des performances
  logPerformance(performanceData) {
    // Stocker les métriques de performance
    this.redis.rpush(
      'api_performance_logs', 
      JSON.stringify(performanceData)
    );
  }

  // Analyse des performances
  async getPerformanceAnalytics(period = 'daily') {
    const logs = await this.redis.lrange('api_performance_logs', 0, -1);
    
    const parsedLogs = logs.map(log => JSON.parse(log));
    
    const analytics = {
      totalCalls: parsedLogs.length,
      successRate: this.calculateSuccessRate(parsedLogs),
      averageResponseTime: this.calculateAverageResponseTime(parsedLogs),
      slowestCalls: this.findSlowestCalls(parsedLogs)
    };

    return analytics;
  }

  // Calcul du taux de succès
  calculateSuccessRate(logs) {
    const successfulCalls = logs.filter(log => log.status === 'success');
    return (successfulCalls.length / logs.length) * 100;
  }

  // Calcul du temps de réponse moyen
  calculateAverageResponseTime(logs) {
    const totalDuration = logs.reduce((sum, log) => sum + log.duration, 0);
    return totalDuration / logs.length;
  }

  // Identification des appels les plus lents
  findSlowestCalls(logs, limit = 5) {
    return logs
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }
}

export default new APIPerformanceManager();
