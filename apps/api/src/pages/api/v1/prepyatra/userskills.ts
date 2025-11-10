import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/lib/constants';
import { updateUserSkillsInDB } from '@/lib/database';
import { cors, sendAPIResponse } from '@/lib/utils';
import { connectDB } from '@/middleware';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);
  await connectDB();
  const { method } = req;

  switch (method) {
    case 'POST':
      return handleAddUserSkills(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${method} Not Allowed`,
        })
      );
  }
};

const handleAddUserSkills = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { userId, userSkills } = req.body as {
      userId: string;
      userSkills: string[];
    };

    if (!userId || !Array.isArray(userSkills)) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'userId and userSkills (array) are required',
        })
      );
    }

    const { data, error } = await updateUserSkillsInDB(userId, userSkills);
    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed to update user skills',
          error,
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: 'User skills updated successfully',
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Internal Server Error',
        error,
      })
    );
  }
};

export default handler;
