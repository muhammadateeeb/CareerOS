// Sentry Error Tracking Integration
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const sentry = {
  // Initialize Sentry client
  init: () => {
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    if (!dsn || dsn === 'https://YOUR_SENTRY_DSN_HERE') {
      console.log('Sentry: No DSN provided, using console logging');
      return;
    }

    try {
      Sentry.init({
        dsn,
        integrations: [new BrowserTracing()],
        tracesSampleRate: 1.0,
        environment: import.meta.env.MODE,
        debug: import.meta.env.DEV,
      });
      console.log('Sentry: Initialized successfully');
    } catch (error) {
      console.error('Sentry: Failed to initialize', error);
    }
  },
  
  // Capture exceptions
  captureException: (error: Error, context?: Record<string, any>) => {
    if (Sentry.getCurrentHub().getClient()) {
      Sentry.captureException(error, { extra: context });
    } else {
      console.error('Sentry Exception:', error, context);
    }
  },
  
  // Capture messages
  captureMessage: (message: string, level: 'info' | 'warning' | 'error' = 'error') => {
    if (Sentry.getCurrentHub().getClient()) {
      Sentry.captureMessage(message, level);
    } else {
      console.log(`Sentry Message [${level}]:`, message);
    }
  },
  
  // Set user context
  setUser: (user: { id: string; email?: string; name?: string }) => {
    if (Sentry.getCurrentHub().getClient()) {
      Sentry.setUser(user);
    } else {
      console.log('Sentry Set User:', user);
    }
  },
  
  // Clear user context
  clearUser: () => {
    if (Sentry.getCurrentHub().getClient()) {
      Sentry.setUser(null);
    } else {
      console.log('Sentry: Clear user');
    }
  },
};

export type SentryConfig = {
  dsn: string;
  environment?: string;
};
