const winston = require('winston');
const Sentry = require('@sentry/node');

// Configuration de Sentry pour le monitoring des erreurs
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true })
  ],
  tracesSampleRate: 0.1 // 10% des transactions
});

// Configuration de Winston pour les logs
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console()
  ]
});

class ErrorHandler {
  // Gestion des erreurs de synchronisation publicitaire
  static handleAdsSyncError(error, context = {}) {
    // Enregistrement de l'erreur
    logger.error('Erreur de synchronisation publicitaire', {
      error: error.message,
      stack: error.stack,
      context
    });

    // Notification Sentry
    Sentry.withScope(scope => {
      scope.setExtra('context', context);
      Sentry.captureException(error);
    });

    // Stratégie de reprise
    this.scheduleRetry(context);
  }

  // Planification de nouvelles tentatives
  static scheduleRetry(context, retryCount = 0) {
    const maxRetries = 3;
    if (retryCount >= maxRetries) {
      logger.warn('Nombre maximal de tentatives atteint', { context });
      return;
    }

    const delay = Math.pow(2, retryCount) * 1000; // Backoff exponentiel

    setTimeout(async () => {
      try {
        // Réessayer la synchronisation
        await this.retrySynchronization(context);
      } catch (retryError) {
        // Nouvelle tentative
        this.scheduleRetry(context, retryCount + 1);
      }
    }, delay);
  }

  // Méthode de reprise de synchronisation
  static async retrySynchronization(context) {
    const { service, method, args } = context;
    
    try {
      const result = await service[method](...args);
      logger.info('Synchronisation réussie après nouvelle tentative', { context });
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Gestion générique des erreurs
  static handleError(error, req, res, next) {
    // Log de l'erreur
    logger.error('Erreur serveur', {
      method: req.method,
      path: req.path,
      error: error.message,
      stack: error.stack
    });

    // Notification Sentry
    Sentry.captureException(error);

    // Réponse adaptée
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      message: process.env.NODE_ENV === 'production' 
        ? 'Une erreur est survenue' 
        : error.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
  }

  // Validation des données sensibles
  static sanitizeData(data) {
    const sensitiveFields = [
      'password', 
      'token', 
      'refreshToken', 
      'creditCard'
    ];

    const sanitized = { ...data };
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}

module.exports = ErrorHandler;
