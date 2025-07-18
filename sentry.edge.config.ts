import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://17f4e904e93ad0db8706fb1bd808d2c3@o4509552599695360.ingest.us.sentry.io/4509552601137152',

  // Disable tracing in Edge Runtime to avoid OpenTelemetry browser module issues
  tracesSampleRate: 0,

  // Disable integrations that might cause issues in Edge Runtime
  integrations: [],

  // Disable debug mode
  debug: false,

  // Set environment
  environment: process.env.NODE_ENV || 'development',
});
