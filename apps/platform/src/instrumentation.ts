// Import polyfills first to ensure they're loaded before Sentry
import './polyfills';

// Only import Sentry in production to avoid OpenTelemetry conflicts in development
let Sentry: any = null;

if (process.env.NODE_ENV === 'production' || process.env.ENABLE_SENTRY === 'true') {
  Sentry = require('@sentry/nextjs');
}

export async function register() {
  // Skip Sentry initialization in development to avoid OpenTelemetry errors
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  // Only initialize Sentry in production
  if (Sentry && process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      await import('../sentry.server.config');
    } catch (error) {
      console.error('Sentry initialization failed:', error);
    }
  }

  if (Sentry && process.env.NEXT_RUNTIME === 'edge') {
    try {
      await import('../sentry.edge.config');
    } catch (error) {
      console.error('Sentry edge initialization failed:', error);
    }
  }
}

export const onRequestError = Sentry?.captureRequestError || (() => {});
