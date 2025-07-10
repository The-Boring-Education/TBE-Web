import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import { getLastPrepLogByUserFromDB } from '@/database';
import { connectDB } from '@/middlewares';
import { cors, sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);
  await connectDB();

  switch (req.method) {
    case 'GET':
      return handleGetLastLog(req, res);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} not allowed`,
        })
      );
  }
};

const handleGetLastLog = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Missing or invalid userId',
        })
      );
    }

    const { data, error } = await getLastPrepLogByUserFromDB(userId);

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: error,
        })
      );
    }

    // If no prep log found, return null with additional info for UI
    if (!data) {
      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          message: 'No prep logs found for user',
          data: null,
          details: {
            hasLogs: false,
            shouldEncourage: true,
          },
        })
      );
    }

    // Calculate days since last log for UI decisions
    const daysSinceLastLog = Math.floor(
      (new Date().getTime() - new Date((data as any).createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Last prep log retrieved successfully',
        data,
        details: {
          hasLogs: true,
          daysSinceLastLog,
          shouldEncourage: daysSinceLastLog > 3, // Encourage if more than 3 days
        },
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Something went wrong while fetching last prep log',
        error,
      })
    );
  }
};

export default handler;