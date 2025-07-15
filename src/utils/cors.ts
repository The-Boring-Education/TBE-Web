import Cors from 'cors';

import { envConfig } from '@/constant';

import initMiddleware from './initMiddleware';

const allowedOrigins = [envConfig.PREPYATRA_APP_URL, envConfig.ONBOARDING_APP_URL];

export const cors = initMiddleware(
  Cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'OPTIONS', 'DELETE'],
    credentials: true,
  })
);
