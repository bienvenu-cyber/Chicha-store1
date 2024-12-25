import os from 'os';
import { logger } from '../src/config/logger.js.js.js';

function checkSystemResources() {
  const cpuUsage = process.cpuUsage();
  const memoryUsage = process.memoryUsage();
  const systemMemory = {
    total: os.totalmem(),
    free: os.freemem(),
    used: os.totalmem() - os.freemem()
  };

  logger.info('System Resources', {
    cpu: {
      user: cpuUsage.system / 1000000,
      system: cpuUsage.user / 1000000
    },
    memory: {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external
    },
    systemMemory: {
      total: systemMemory.total,
      free: systemMemory.free,
      used: systemMemory.used,
      usagePercent: (systemMemory.used / systemMemory.total) * 100
    },
    loadAverage: os.loadavg()
  });

  // Alertes si ressources critiques
  if ((systemMemory.used / systemMemory.total) > 0.90) {
    logger.warn('High Memory Usage', {
      message: 'Memory usage exceeded 90%',
      usagePercent: (systemMemory.used / systemMemory.total) * 100
    });
  }

  if (os.loadavg()[0] > os.cpus().length) {
    logger.warn('High CPU Load', {
      message: 'System load is higher than number of CPUs',
      loadAverage: os.loadavg()
    });
  }
}

// Surveiller toutes les 5 minutes
setInterval(checkSystemResources, 5 * 60 * 1000);

export default checkSystemResources;
