import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@tbe/constants';
import { getAllUsersWithLogsFromDB } from '@tbe/database';
import { connectDB } from '@/middleware';
import { sendAPIResponse } from '@tbe/utils';
import { cors } from '@tbe/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await connectDB();

  if (req.method !== 'GET') {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} not allowed`,
      })
    );
  }

  return handleGetUsersWithLogs(req, res);
};

const handleGetUsersWithLogs = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    console.log('getAllUsersWithLogsFromDB');
    const { data, error } = await getAllUsersWithLogsFromDB();

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed to fetch users with logs',
          error,
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Users with logs fetched successfully',
        data,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Something went wrong while fetching users with logs',
        error,
      })
    );
  }
};

export default handler;
