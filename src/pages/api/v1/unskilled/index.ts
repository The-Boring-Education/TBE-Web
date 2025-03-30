import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/middlewares';
import { apiStatusCodes } from '@/constant';
import { readJSONFile, UNSKILL_DATA_FILE, writeJSONFile } from '@/utils/server';
import { getJobsAggregationFromDB } from '@/database';
import { sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  switch (req.method) {
    case 'GET':
      return handleFetchJobData(req, res);
    case 'POST':
      return handleAggregateJobData(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Method ${req.method} not allowed`,
      });
  }
};

const handleFetchJobData = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const data = readJSONFile(UNSKILL_DATA_FILE);
    const today = new Date().toISOString().split('T')[0];

    if (data && data.lastUpdated === today) {
      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          message: 'Job market insights fetched successfully',
          data,
        })
      );
    }

    const { error, data: unskilledData } = await getJobsAggregationFromDB();

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed to aggregate job data',
          error,
        })
      );
    }

    const aggregatedData = {
      lastUpdated: today,
      ...unskilledData,
    };

    writeJSONFile(UNSKILL_DATA_FILE, aggregatedData);

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Job data aggregated and saved successfully',
        data: aggregatedData,
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

const handleAggregateJobData = async (
  _req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { error, data } = await getJobsAggregationFromDB();

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed to aggregate job data',
          error,
        })
      );
    }

    const aggregatedData = {
      lastUpdated: today,
      ...data,
    };

    writeJSONFile(UNSKILL_DATA_FILE, aggregatedData);

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Job data aggregated and saved successfully',
        data: aggregatedData,
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
