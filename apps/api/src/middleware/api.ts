import mongoose from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';

import { envConfig, apiStatusCodes } from '@/constant';
import { sendAPIResponse } from '@/utils';

// Connect to DB
const connectDB = async () => {
  try {
    await mongoose.connect(envConfig.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

// Admin authentication middleware
const adminMiddleware = async (
  req: NextApiRequest, 
  res: NextApiResponse
): Promise<boolean> => {
  try {
    const adminHeader = req.headers['x-admin-secret'];
    const expectedSecret = process.env.ADMIN_SECRET || 'TBEAdmin';
    
    if (!adminHeader || adminHeader !== expectedSecret) {
      res.status(apiStatusCodes.UNAUTHORIZED).json(
        sendAPIResponse({ 
          status: false, 
          message: 'Unauthorized. Admin access required.' 
        })
      );
      return false;
    }
    
    return true;
  } catch (error) {
    res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Admin authentication error',
        error,
      })
    );
    return false;
  }
};

export { connectDB, adminMiddleware };
