import prometheus from 'prom-client';
import os from 'os';

class PerformanceMonitoring {
  constructor() {
    // Configuration Prometheus
    prometheus.collectDefaultMetrics({
      labels: { service: 'chicha-store' }
    });

    // Métriques personnalisées
    this.requestDuration = new prometheus.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'code'],
      buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 5]
    });

    this.databaseQueryDuration = new prometheus.Histogram({
      name: 'database_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['collection', 'operation'],
      buckets: [0.01, 0.1, 0.5, 1, 2, 5]
    });

    this.cacheHitRate = new prometheus.Gauge({
      name: 'cache_hit_rate',
      help: 'Percentage of cache hits',
      labelNames: ['cache_type']
    });
  }

  // Middleware de monitoring des requêtes
  requestMonitoring() {
    return (req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        
        this.requestDuration
          .labels(req.method, req.route?.path || req.path, res.statusCode)
          .observe(duration);
      });

      next();
    };
  }

  // Monitoring des requêtes base de données
  monitorDatabaseQuery(collection, operation, queryFn) {
    return async (...args) => {
      const start = Date.now();
      
      try {
        const result = await queryFn(...args);
        
        const duration = (Date.now() - start) / 1000;
        this.databaseQueryDuration
          .labels(collection, operation)
          .observe(duration);
        
        return result;
      } catch (error) {
        // Gérer et enregistrer les erreurs
        console.error(`Database query error: ${error.message}`);
        throw error;
      }
    };
  }

  // Monitoring du cache
  updateCacheMetrics(cacheType, hitRate) {
    this.cacheHitRate
      .labels(cacheType)
      .set(hitRate);
  }

  // Métriques système
  getSystemMetrics() {
    return {
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      systemLoad: os.loadavg(),
      freeMemory: os.freemem(),
      totalMemory: os.totalmem()
    };
  }

  // Endpoint Prometheus
  getMetricsEndpoint() {
    return async (req, res) => {
      res.set('Content-Type', prometheus.register.contentType);
      res.end(await prometheus.register.metrics());
    };
  }
}

export default new PerformanceMonitoring();
