import Cors from 'cors';

import { envConfig } from '@/constant';

import initMiddleware from './initMiddleware';


export const cors = initMiddleware(
  Cors({
    origin: envConfig.PY_FRONTEND,
    methods: ['GET', 'POST','PUT', 'OPTIONS','DELETE'],
    credentials:true,
})
);