import Cors from 'cors';

import initMiddleware from '@/utils/initMiddleware';

const cors = initMiddleware(
  Cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: false, // Set to false when using origin: '*'
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret'],
  })
);

export default cors; 