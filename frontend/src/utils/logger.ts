import * as Sentry from "@sentry/react";

class Logger {
  static init() {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay()
      ],
      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 0.5,
      environment: process.env.NODE_ENV,
      release: process.env.npm_package_version,
    });
  }

  static log(message: string, context?: any) {
    console.log(message, context);
  }

  static error(message: string, error?: Error) {
    console.error(message, error);
    Sentry.captureException(error, {
      extra: { message }
    });
  }

  static warn(message: string, context?: any) {
    console.warn(message, context);
    Sentry.captureMessage(message, 'warning');
  }

  static info(message: string, context?: any) {
    console.info(message, context);
  }

  static setUser(user: { id: string, email?: string }) {
    Sentry.setUser(user);
  }

  static addBreadcrumb(message: string, category?: string) {
    Sentry.addBreadcrumb({
      category: category || 'default',
      message: message,
      level: 'info'
    });
  }
}

export default Logger;
