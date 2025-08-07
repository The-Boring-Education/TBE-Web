import Cors from 'cors';

import { envConfig } from '@/constant';

import initMiddleware from './initMiddleware';

const allowedOrigins = [
  envConfig.PREPYATRA_APP_URL,
  envConfig.NEXT_PUBLIC_ONBOARDING_APP_URL,
  envConfig.QUIZ_APP_URL,
  envConfig.ADMIN_BASE_URL,
].filter(Boolean);

export const cors = initMiddleware(
  Cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret'],
  })
);
