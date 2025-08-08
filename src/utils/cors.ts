import Cors from 'cors';

import { envConfig } from '@/constant';

import initMiddleware from './initMiddleware';

const allowedOrigins = [
  envConfig.PREPYATRA_APP_URL,
  envConfig.NEXT_PUBLIC_ONBOARDING_APP_URL,
  envConfig.QUIZ_APP_URL,
  envConfig.ADMIN_BASE_URL,
].filter(Boolean);

// Whitelist all origins for now
export const cors = initMiddleware(
  Cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: false, // Set to false when using origin: '*'
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret'],
  })
);
