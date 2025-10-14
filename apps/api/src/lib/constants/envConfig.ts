const NODE_ENV = process.env.NODE_ENV as string
const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL as string
const MONGODB_URI = process.env.MONGODB_URI as string
const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL as string
const API_URL = process.env.NEXT_PUBLIC_API_URL as string
const ADMIN_SECRET = process.env.ADMIN_SECRET as string
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET as string
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS as string
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY as string
const ADMIN_BASE_URL = process.env.ADMIN_BASE_URL as string
const CASHFREE_BASE_URL = process.env.CASHFREE_BASE_URL as string
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY as string
const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID as string
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN as string
const PREPYATRA_APP_URL = process.env.PREPYATRA_APP_URL as string
const ONBOARDING_URL = process.env.NEXT_PUBLIC_ONBOARDING_APP_URL as string
const QUIZ_APP_URL = process.env.QUIZ_APP_URL as string

// Email Service Configuration
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL as string
const EMAIL_API_KEY = process.env.EMAIL_API_KEY as string
const FROM_EMAIL = process.env.FROM_EMAIL as string

const envConfig = {
    NODE_ENV,
    PLATFORM_URL,
    MONGODB_URI,
    API_URL,
    ADMIN_SECRET,
    YOUTUBE_API_KEY,
    NEXTAUTH_SECRET,
    AUTH_URL,
    GA_TRACKING_ID,
    ADMIN_BASE_URL,
    CASHFREE_BASE_URL,
    CASHFREE_SECRET_KEY,
    CASHFREE_CLIENT_ID,
    SENTRY_DSN,
    PREPYATRA_APP_URL,
    EMAIL_SERVICE_URL,
    EMAIL_API_KEY,
    FROM_EMAIL,
    ONBOARDING_URL,
    QUIZ_APP_URL
}

export { envConfig }
