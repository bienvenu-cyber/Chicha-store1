import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export function initializeSentry(app) {
  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [
        nodeProfilingIntegration(),
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app })
      ],
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      environment: process.env.NODE_ENV || 'development',
      enabled: !!process.env.SENTRY_DSN
    });

    // Middleware pour le suivi des requêtes
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());

    // Gestionnaire d'erreurs
    app.use(Sentry.Handlers.errorHandler());

    console.log('Sentry initialisé avec succès');
    return Sentry;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de Sentry:', error);
    return null;
  }
}
