const prometheus = import('prom-client');
const mongoose = import('mongoose');
const os = import('os');

class ContinuousPerformanceMonitoring {
  constructor(mongoUri) {
    this.mongoUri = mongoUri;
    this.initPrometheusMetrics();
  }

  initPrometheusMetrics() {
    // Configuration globale Prometheus
    prometheus.collectDefaultMetrics({
      labels: { service: 'chicha-store' }
    });

    // Métriques personnalisées
    this.requestDuration = new prometheus.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Durée des requêtes HTTP',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 5]
    });

    this.databaseQueryDuration = new prometheus.Histogram({
      name: 'database_query_duration_seconds',
      help: 'Durée des requêtes MongoDB',
      labelNames: ['collection', 'operation'],
      buckets: [0.01, 0.1, 0.5, 1, 2, 5]
    });

    this.systemResourceMetrics = {
      cpuUsage: new prometheus.Gauge({
        name: 'system_cpu_usage_percentage',
        help: 'Utilisation du CPU en pourcentage'
      }),
      memoryUsage: new prometheus.Gauge({
        name: 'system_memory_usage_bytes',
        help: 'Utilisation de la mémoire en octets'
      })
    };
  }

  // Middleware de monitoring des requêtes
  requestMonitorMiddleware() {
    return async (req, res, next) => {
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

  // Monitoring des requêtes MongoDB
  mongooseMonitoring() {
    const originalExec = mongoose.Query.prototype.exec;
    
    mongoose.Query.prototype.exec = function() {
      const start = Date.now();
      const query = this;
      
      return originalExec.apply(this, arguments)
        .then((result) => {
          const duration = (Date.now() - start) / 1000;
          
          this.databaseQueryDuration
            .labels(query.model.modelName, query.op)
            .observe(duration);
          
          return result;
        });
    };
  }

  // Collecte des métriques système
  startSystemMetricsCollection() {
    setInterval(() => {
      const cpuUsage = os.cpus().map(cpu => cpu.times);
      const totalCpuUsage = cpuUsage.reduce((acc, times) => 
        acc + (times.user + times.nice + times.sys) / 
        (times.user + times.nice + times.sys + times.idle), 0) / cpuUsage.length;

      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const memoryUsage = totalMemory - freeMemory;

      this.systemResourceMetrics.cpuUsage.set(totalCpuUsage * 100);
      this.systemResourceMetrics.memoryUsage.set(memoryUsage);
    }, 5000);
  }

  // Configuration du serveur Prometheus
  startPrometheusServer(port = 9090) {
    const express = import('express');
    const server = express();

    server.get('/metrics', async (req, res) => {
      res.set('Content-Type', prometheus.register.contentType);
      res.end(await prometheus.register.metrics());
    });

    server.listen(port, () => {
      console.log(`🔍 Serveur Prometheus démarré sur le port ${port}`);
    });
  }

  // Initialisation complète du monitoring
  async initialize(mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      this.mongooseMonitoring();
      this.startSystemMetricsCollection();
      this.startPrometheusServer();
      
      console.log('✅ Monitoring de performance initialisé');
    } catch (error) {
      console.error('❌ Erreur d\'initialisation du monitoring', error);
    }
  }
}

export default = ContinuousPerformanceMonitoring;
