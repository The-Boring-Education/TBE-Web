import * as Sentry from '@sentry/nextjs';
import { envConfig } from '@/constant/envConfig';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side Sentry configuration
    Sentry.init({
      dsn: envConfig.SENTRY_DSN,

      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: envConfig.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: envConfig.NODE_ENV === 'development',

      // Environment
      environment: envConfig.NODE_ENV,

      // Release tracking
      release: process.env.npm_package_version,

      // Configure error filtering for server
      beforeSend(event, hint) {
        // Filter out known noisy errors
        if (event.exception) {
          const error = hint.originalException;

          if (error instanceof Error) {
            // Filter out MongoDB connection errors in development
            if (
              envConfig.NODE_ENV === 'development' &&
              error.message.includes('MongooseError')
            ) {
              return null;
            }
          }
        }

        // Log server errors for debugging
        if (envConfig.NODE_ENV === 'development') {
          console.log('Sentry Server Error:', event);
        }

        return event;
      },

      // Tag all events with additional context
      initialScope: {
        tags: {
          component: 'server',
        },
      },
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime Sentry configuration
    Sentry.init({
      dsn: envConfig.SENTRY_DSN,

      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: envConfig.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: envConfig.NODE_ENV === 'development',

      // Environment
      environment: envConfig.NODE_ENV,

      // Release tracking
      release: process.env.npm_package_version,

      // Tag all events with additional context
      initialScope: {
        tags: {
          component: 'edge',
        },
      },
    });
  }
}
