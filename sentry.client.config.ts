// This file configures the initialization of Sentry on the browser side.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

import { envConfig } from '@/constant/envConfig';

Sentry.init({
  dsn: envConfig.SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: envConfig.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: envConfig.NODE_ENV === 'development',

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: envConfig.NODE_ENV === 'production' ? 0.01 : 0.1,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Environment
  environment: envConfig.NODE_ENV,

  // Release tracking
  release: process.env.npm_package_version,

  // Configure error filtering
  beforeSend(event, hint) {
    // Filter out known noisy errors
    if (event.exception) {
      const error = hint.originalException;
      
      // Filter out network errors
      if (error instanceof Error) {
        if (error.message.includes('NetworkError') || 
            error.message.includes('fetch') ||
            error.message.includes('ChunkLoadError')) {
          return null;
        }
      }
    }

    return event;
  },

  // Tag all events with additional context
  initialScope: {
    tags: {
      component: 'client',
    },
  },
});