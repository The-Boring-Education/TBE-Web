import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/middlewares';
import { cors } from '@/utils/cors';
import { apiStatusCodes } from '@/constant';
import { sendAPIResponse } from '@/utils';
import Challenge from '@/database/models/PrepYatra/Challenge';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);
  await connectDB();
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGetChallenges(req, res);
    case 'POST':
      return handleCreateChallenge(req, res);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};

const handleGetChallenges = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId: queryUserId } = req.query;
    if (!queryUserId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'User ID is required',
        })
      );
    }

    const challenges = await Challenge.find({ user: String(queryUserId) }).sort({ createdAt: -1 });
    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Challenges retrieved successfully',
        data: challenges,
      })
    );
  } catch (error) {
    console.error('Get Challenges Error:', error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    );
  }
};

const handleCreateChallenge = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { name, totalDays, category, user, userId } = req.body;
    
    // Accept both 'user' and 'userId' for flexibility
    const userField = user || userId;
    
    if (!name || !totalDays || !userField) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Name, total days, and user/userId are required',
        })
      );
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + totalDays);

    const challenge = new Challenge({
      user: userField,
      name,
      totalDays,
      startDate,
      endDate,
      category,
      currentDay: 0,
      isActive: true
    });

    await challenge.save();
    return res.status(apiStatusCodes.RESOURCE_CREATED).json(
      sendAPIResponse({
        status: true,
        message: 'Challenge created successfully',
        data: challenge,
      })
    );
  } catch (error) {
    console.error('Create Challenge Error:', error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    );
  }
};

export default handler;