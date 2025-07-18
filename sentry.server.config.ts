import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://17f4e904e93ad0db8706fb1bd808d2c3@o4509552599695360.ingest.us.sentry.io/4509552601137152',

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
