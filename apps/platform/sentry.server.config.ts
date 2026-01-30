import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,

  // Disable automatic OpenTelemetry instrumentation to avoid version conflicts
  // We'll rely on Sentry's built-in instrumentation instead
  autoInstrumentServerFunctions: false,
  autoInstrumentMiddleware: false,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
