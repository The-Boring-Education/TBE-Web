// Import polyfills first to ensure they're loaded before Sentry
import './polyfills';

// Only import Sentry in production to avoid OpenTelemetry conflicts in development
let Sentry: any = null;

if (process.env.NODE_ENV === 'production' || process.env.ENABLE_SENTRY === 'true') {
  Sentry = require('@sentry/nextjs');
}

export async function register() {
  // Only initialize Sentry if DSN is configured
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn('Sentry DSN not configured, skipping Sentry initialization');
    return;
  }

  try {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await import('../sentry.server.config');
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
      await import('../sentry.edge.config');
    }
  } catch (error) {
    // Gracefully handle Sentry initialization errors
    // This prevents the app from crashing if Sentry/OpenTelemetry has issues
    console.error('Failed to initialize Sentry:', error);
  }
}

export const onRequestError = Sentry?.captureRequestError || (() => {});
