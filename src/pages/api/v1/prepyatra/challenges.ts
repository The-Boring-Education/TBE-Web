import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import {
  createChallengeInDB,
  deleteChallengeInDB,
  getChallengesByUserFromDB,
  getChallengeProgressFromDB,
  updateChallengeInDB,
} from '@/database';
import { connectDB } from '@/middlewares';
import { cors, sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);
  await connectDB();

  switch (req.method) {
    case 'POST':
      return handleCreateChallenge(req, res);
    case 'GET':
      if (req.query.challengeId) {
        return handleGetChallengeProgress(req, res);
      }
      return handleGetChallenges(req, res);
    case 'PUT':
      return handleUpdateChallenge(req, res);
    case 'DELETE':
      return handleDeleteChallenge(req, res);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} not allowed`,
        })
      );
  }
};

const handleCreateChallenge = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId, name, description, totalDays, isPredefined, predefinedType } = req.body;

    if (!userId || !name || !totalDays) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'userId, name, and totalDays are required',
        })
      );
    }

    if (totalDays < 1 || totalDays > 365) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'totalDays must be between 1 and 365',
        })
      );
    }

    const result = await createChallengeInDB({
      userId,
      name,
      description,
      totalDays,
      isPredefined: isPredefined || false,
      predefinedType,
    });

    if (result.error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: result.error,
        })
      );
    }

    return res.status(apiStatusCodes.CREATED).json(
      sendAPIResponse({
        status: true,
        message: 'Challenge created successfully',
        data: result.data,
      })
    );
  } catch (error: any) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: error.message || 'Internal server error',
      })
    );
  }
};

const handleGetChallenges = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'userId is required',
        })
      );
    }

    const result = await getChallengesByUserFromDB(userId as string);

    if (result.error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: result.error,
        })
      );
    }

    return res.status(apiStatusCodes.OK).json(
      sendAPIResponse({
        status: true,
        message: 'Challenges fetched successfully',
        data: result.data,
      })
    );
  } catch (error: any) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: error.message || 'Internal server error',
      })
    );
  }
};

const handleGetChallengeProgress = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { challengeId } = req.query;

    if (!challengeId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'challengeId is required',
        })
      );
    }

    const result = await getChallengeProgressFromDB(challengeId as string);

    if (result.error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: result.error,
        })
      );
    }

    return res.status(apiStatusCodes.OK).json(
      sendAPIResponse({
        status: true,
        message: 'Challenge progress fetched successfully',
        data: result.data,
      })
    );
  } catch (error: any) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: error.message || 'Internal server error',
      })
    );
  }
};

const handleUpdateChallenge = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { challengeId, ...updateData } = req.body;

    if (!challengeId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'challengeId is required',
        })
      );
    }

    // Validate totalDays if provided
    if (updateData.totalDays && (updateData.totalDays < 1 || updateData.totalDays > 365)) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'totalDays must be between 1 and 365',
        })
      );
    }

    const result = await updateChallengeInDB(challengeId, updateData);

    if (result.error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: result.error,
        })
      );
    }

    return res.status(apiStatusCodes.OK).json(
      sendAPIResponse({
        status: true,
        message: 'Challenge updated successfully',
        data: result.data,
      })
    );
  } catch (error: any) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: error.message || 'Internal server error',
      })
    );
  }
};

const handleDeleteChallenge = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { challengeId } = req.query;

    if (!challengeId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'challengeId is required',
        })
      );
    }

    const result = await deleteChallengeInDB(challengeId as string);

    if (result.error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: result.error,
        })
      );
    }

    return res.status(apiStatusCodes.OK).json(
      sendAPIResponse({
        status: true,
        message: 'Challenge deleted successfully',
        data: result.data,
      })
    );
  } catch (error: any) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: error.message || 'Internal server error',
      })
    );
  }
};

export default handler;