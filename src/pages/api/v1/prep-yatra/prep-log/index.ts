import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import {
  addPrepLogToDB,
} from '@/database';
import { connectDB } from '@/middlewares';
import { cors,sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);
  await connectDB();

  switch (req.method) {
    case 'POST':
      return handleAddLog(req, res);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(sendAPIResponse({
        status: false,
        message: `Method ${req.method} not allowed`
      }));
  }
};

const handleAddLog = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId, title, description, timeSpent } = req.body;

  if (!userId || !title || !timeSpent) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(sendAPIResponse({
      status: false,
      message: 'userId, title, and durationDays are required'
    }));
  }

  const { data, error } = await addPrepLogToDB({ 
    userId, 
    title, 
    description, 
    timeSpent 
  });

  if (error) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({ 
        status: false, 
        message: error 
      })
    );
  }

  return res.status(apiStatusCodes.RESOURCE_CREATED).json(
    sendAPIResponse({ 
      status: true, 
      message: 'Prep log created', 
      data 
    })
  );
  } catch (error) {
     return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Something went wrong while creating recruiter',
        error,
      })
    );
  }
};

export default handler;
