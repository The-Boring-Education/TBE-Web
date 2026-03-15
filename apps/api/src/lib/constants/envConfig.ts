const REQUIRED_VARS = [
  "MONGODB_URI",
  "NEXTAUTH_SECRET",
  "ADMIN_SECRET",
] as const;

const OPTIONAL_VARS = [
  "NODE_ENV",
  "NEXT_PUBLIC_PLATFORM_URL",
  "NEXT_PUBLIC_AUTH_URL",
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_GOOGLE_ANALYTICS",
  "YOUTUBE_API_KEY",
  "ADMIN_BASE_URL",
  "CASHFREE_BASE_URL",
  "CASHFREE_SECRET_KEY",
  "CASHFREE_CLIENT_ID",
  "NEXT_PUBLIC_SENTRY_DSN",
  "PREPYATRA_APP_URL",
  "NEXT_PUBLIC_ONBOARDING_APP_URL",
  "QUIZ_APP_URL",
  "EMAIL_SERVICE_URL",
  "EMAIL_API_KEY",
  "FROM_EMAIL",
] as const;

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  const msg = `Missing required environment variables: ${missing.join(", ")}`;
  console.error(`[envConfig] FATAL: ${msg}`);
  if (process.env.NODE_ENV === "production") {
    throw new Error(msg);
  }
}

const warnMissing = OPTIONAL_VARS.filter(
  (key) => !process.env[key] && key === "NEXT_PUBLIC_SENTRY_DSN",
);
if (warnMissing.length > 0) {
  console.warn(
    `[envConfig] Warning: Missing optional env vars: ${warnMissing.join(", ")}`,
  );
}

const envConfig = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PLATFORM_URL: process.env.NEXT_PUBLIC_PLATFORM_URL || "",
  MONGODB_URI: process.env.MONGODB_URI as string,
  API_URL: process.env.NEXT_PUBLIC_API_URL || "",
  ADMIN_SECRET: process.env.ADMIN_SECRET as string,
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || "",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET as string,
  AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL || "",
  GA_TRACKING_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || "",
  ADMIN_BASE_URL: process.env.ADMIN_BASE_URL || "",
  CASHFREE_BASE_URL: process.env.CASHFREE_BASE_URL || "",
  CASHFREE_SECRET_KEY: process.env.CASHFREE_SECRET_KEY || "",
  CASHFREE_CLIENT_ID: process.env.CASHFREE_CLIENT_ID || "",
  SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  PREPYATRA_APP_URL: process.env.PREPYATRA_APP_URL || "",
  EMAIL_SERVICE_URL: process.env.EMAIL_SERVICE_URL || "",
  EMAIL_API_KEY: process.env.EMAIL_API_KEY || "",
  FROM_EMAIL: process.env.FROM_EMAIL || "",
  ONBOARDING_URL: process.env.NEXT_PUBLIC_ONBOARDING_APP_URL || "",
  QUIZ_APP_URL: process.env.QUIZ_APP_URL || "",
};

export { envConfig };
