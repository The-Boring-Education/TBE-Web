import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import {
  getLatestJobAggregationFromDB,
  saveDailyJobsAggregationToDB,
} from '@/database';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';
import { cors } from '@/utils/cors';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Apply CORS headers
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await connectDB();

  switch (req.method) {
    case 'GET':
      return handleGetDailyJobAggregation(req, res);
    case 'POST':
      return handleAggregateJobData(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Method ${req.method} not allowed`,
      });
  }
};

// This API is for UI ONLY
const handleGetDailyJobAggregation = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { data } = await getLatestJobAggregationFromDB();

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Error fetching job market data',
        error,
      })
    );
  }
};

// This API will be used to aggregate job data and CRON will call it
const handleAggregateJobData = async (
  _req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { error, data } = await saveDailyJobsAggregationToDB();

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed to aggregate job data',
          error,
        })
      );
    }

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed to save job aggregated data to DB',
          error,
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Job data aggregated and saved successfully',
        data,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'An unexpected error occurred while aggregating job data',
        error,
      })
    );
  }
};

export default handler;
