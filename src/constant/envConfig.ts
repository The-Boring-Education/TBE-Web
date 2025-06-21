const NODE_ENV = process.env.NODE_ENV as string;
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;
const MONGODB_URI = process.env.MONGODB_URI as string;
const BASE_API_URL = process.env.BASE_API_URL as string;
const BASE_AUTH_API_URL = process.env.BASE_AUTH_API_URL as string;
const GOOGLE_AUTH_CLIENT_ID = process.env.GOOGLE_AUTH_CLIENT_ID as string;
const GOOGLE_AUTH_CLIENT_SECRET = process.env
  .GOOGLE_AUTH_CLIENT_SECRET as string;
const ADMIN_SECRET = process.env.ADMIN_SECRET as string;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET as string;
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS as string;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY as string;
const ADMIN_BASE_URL = process.env.ADMIN_BASE_URL as string;
const CASHFREE_BASE_URL = process.env.CASHFREE_BASE_URL as string;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY as string;
const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID as string;
const PY_FRONTEND = process.env.PY_FRONTEND as string;


const envConfig = {
  NODE_ENV,
  NEXT_PUBLIC_BASE_URL,
  MONGODB_URI,
  BASE_API_URL,
  GOOGLE_AUTH_CLIENT_ID,
  GOOGLE_AUTH_CLIENT_SECRET,
  ADMIN_SECRET,
  YOUTUBE_API_KEY,
  NEXTAUTH_SECRET,
  BASE_AUTH_API_URL,
  GA_TRACKING_ID,
  ADMIN_BASE_URL,
  CASHFREE_BASE_URL,
  CASHFREE_SECRET_KEY,
  CASHFREE_CLIENT_ID,
  PY_FRONTEND,
};

export { envConfig };
