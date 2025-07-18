import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Disable tracing in Edge Runtime to avoid OpenTelemetry browser module issues
  tracesSampleRate: 0,

  // Disable integrations that might cause issues in Edge Runtime
  integrations: [],

  // Disable debug mode
  debug: false,

  // Set environment
  environment: process.env.NODE_ENV || 'development',
});
