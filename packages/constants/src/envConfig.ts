const NODE_ENV = process.env.NODE_ENV as string;
const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL as string;
const MONGODB_URI = process.env.MONGODB_URI as string;
const API_URL = process.env.NEXT_PUBLIC_API_URL as string;
const GOOGLE_AUTH_CLIENT_ID = process.env.GOOGLE_AUTH_CLIENT_ID as string;
const GOOGLE_AUTH_CLIENT_SECRET = process.env
  .GOOGLE_AUTH_CLIENT_SECRET as string;
const ADMIN_SECRET = process.env.ADMIN_SECRET as string;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET as string;
const GA_TRACKING_ID = (process.env.NEXT_PUBLIC_ANALYTICS_ID ||
  process.env.NEXT_PUBLIC_GA_TRACKING_ID ||
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
  "") as string;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY as string;
const ADMIN_BASE_URL = process.env.ADMIN_BASE_URL as string;
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN as string;
const PREPYATRA_APP_URL = process.env.PREPYATRA_APP_URL as string;
const ONBOARDING_URL = process.env.NEXT_PUBLIC_ONBOARDING_APP_URL as string;
const QUIZ_APP_URL = process.env.QUIZ_APP_URL as string;
const UNSKILLED_API_URL = process.env.NEXT_PUBLIC_UNSKILLED_API_URL as string;

// Chitthi (email service) configuration. Legacy EMAIL_* vars are accepted
// as fallbacks so existing deployments keep working.
const CHITTHI_URL = (process.env.CHITTHI_URL ||
  process.env.EMAIL_SERVICE_URL ||
  "") as string;
const CHITTHI_API_KEY = (process.env.CHITTHI_API_KEY ||
  process.env.EMAIL_API_KEY ||
  "") as string;
const CHITTHI_FROM_EMAIL = (process.env.CHITTHI_FROM_EMAIL ||
  process.env.FROM_EMAIL ||
  "") as string;
// Deprecated aliases – kept for backward compatibility with older callers.
const EMAIL_SERVICE_URL = CHITTHI_URL;
const EMAIL_API_KEY = CHITTHI_API_KEY;
const FROM_EMAIL = CHITTHI_FROM_EMAIL;

const envConfig = {
  NODE_ENV,
  PLATFORM_URL,
  MONGODB_URI,
  API_URL,
  GOOGLE_AUTH_CLIENT_ID,
  GOOGLE_AUTH_CLIENT_SECRET,
  ADMIN_SECRET,
  YOUTUBE_API_KEY,
  NEXTAUTH_SECRET,
  GA_TRACKING_ID,
  ADMIN_BASE_URL,
  SENTRY_DSN,
  PREPYATRA_APP_URL,
  CHITTHI_URL,
  CHITTHI_API_KEY,
  CHITTHI_FROM_EMAIL,
  EMAIL_SERVICE_URL,
  EMAIL_API_KEY,
  FROM_EMAIL,
  ONBOARDING_URL,
  QUIZ_APP_URL,
  UNSKILLED_API_URL,
};

export { envConfig };
