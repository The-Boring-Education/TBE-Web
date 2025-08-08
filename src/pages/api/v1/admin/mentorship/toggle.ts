import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';
import { cors } from '@/utils/cors';
import { toggleMentorshipInDB } from '@/database';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await connectDB();

  if (req.method !== 'POST') {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({ status: false, message: `Method ${req.method} not allowed` })
    );
  }

  try {
    const { userId, isSelected, note } = req.body as { userId: string; isSelected: boolean; note?: string };

    if (!userId || typeof isSelected !== 'boolean') {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({ status: false, message: 'Missing required fields: userId, isSelected' })
      );
    }

    const { data, error } = await toggleMentorshipInDB(userId, isSelected, note);
    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({ status: false, message: 'Failed to update mentorship', error })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({ status: true, message: 'Mentorship status updated', data })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({ status: false, message: 'Unexpected error', error })
    );
  }
};

export default handler;

