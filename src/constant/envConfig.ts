const MONGODB_URI = process.env.MONGODB_URI as string;
const BASE_API_URL = process.env.BASE_API_URL as string;
const BASE_AUTH_API_URL = process.env.BASE_AUTH_API_URL as string;
const GOOGLE_AUTH_CLIENT_ID = process.env.GOOGLE_AUTH_CLIENT_ID as string;
const GOOGLE_AUTH_CLIENT_SECRET = process.env
  .GOOGLE_AUTH_CLIENT_SECRET as string;
const ADMIN_SECRET = process.env.ADMIN_SECRET as string;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET as string;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY as string;

const envConfig = {
  MONGODB_URI,
  BASE_API_URL,
  GOOGLE_AUTH_CLIENT_ID,
  GOOGLE_AUTH_CLIENT_SECRET,
  ADMIN_SECRET,
  NEXTAUTH_SECRET,
  BASE_AUTH_API_URL,
  YOUTUBE_API_KEY,
};

export { envConfig };
