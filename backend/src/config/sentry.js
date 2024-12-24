import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";

function initializeSentry(app) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      // Enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // Enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),
      // Add profiling
      new ProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    environment: process.env.NODE_ENV,
    release: process.env.npm_package_version,
  });

  // Middleware for request tracking
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  return Sentry;
}

// Error handler
function sentryErrorHandler(app) {
  app.use(Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Ignore specific errors if needed
      if (error.status === 404 || error.status === 403) {
        return false;
      }
      return true;
    }
  }));
}

export { initializeSentry, sentryErrorHandler };
