import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@tbe/constants';
import { connectDB } from '@/middleware';
import { sendAPIResponse } from '@tbe/utils';
import { cors } from '@tbe/utils';
import { getAllMenteesFromDB } from '@tbe/database';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await connectDB();

  if (req.method === 'GET') {
    try {
      const { data, error } = await getAllMenteesFromDB();
      if (error) {
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
          sendAPIResponse({ status: false, message: 'Failed to fetch mentees', error })
        );
      }

      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({ status: true, message: 'Mentees fetched successfully', data })
      );
    } catch (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({ status: false, message: 'Unexpected error', error })
      );
    }
  }

  if (req.method === 'DELETE') {
    // Handled in /mentees/[userId].ts
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({ status: false, message: 'Use /mentees/[userId] for DELETE' })
    );
  }

  return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
    sendAPIResponse({ status: false, message: `Method ${req.method} not allowed` })
  );
};

export default handler;

