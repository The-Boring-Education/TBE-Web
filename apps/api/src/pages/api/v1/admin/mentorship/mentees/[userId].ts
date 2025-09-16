import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@tbe/constants';
import { connectDB } from '@/middleware';
import { sendAPIResponse } from '@tbe/utils';
import { cors } from '@tbe/utils';
import { toggleMentorshipInDB } from '@tbe/database';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await connectDB();

  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({ status: false, message: 'Invalid userId' })
    );
  }

  if (req.method === 'DELETE') {
    try {
      const { data, error } = await toggleMentorshipInDB(userId, false);
      if (error) {
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
          sendAPIResponse({ status: false, message: 'Failed to remove mentee', error })
        );
      }

      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({ status: true, message: 'Removed from mentorship', data })
      );
    } catch (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({ status: false, message: 'Unexpected error', error })
      );
    }
  }

  return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
    sendAPIResponse({ status: false, message: `Method ${req.method} not allowed` })
  );
};

export default handler;

