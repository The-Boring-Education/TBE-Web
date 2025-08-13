import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import {
  createChallengeLogInDB,
  getChallengeLogsByIdFromDB,
} from '@/database';
import { connectDB } from '@/middlewares';
import { cors, sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);
  await connectDB();

  switch (req.method) {
    case 'POST':
      return handleCreateChallengeLog(req, res);
    case 'GET':
      return handleGetChallengeLogs(req, res);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} not allowed`,
        })
      );
  }
};

const handleCreateChallengeLog = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { challengeId, userId, progressText, hoursSpent, copyToPrepLogs } = req.body;

    if (!challengeId || !userId || !progressText || !hoursSpent) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'challengeId, userId, progressText, and hoursSpent are required',
        })
      );
    }

    if (hoursSpent <= 0 || hoursSpent > 24) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'hoursSpent must be between 0 and 24',
        })
      );
    }

    if (progressText.length > 500) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'progressText must be 500 characters or less',
        })
      );
    }

    const result = await createChallengeLogInDB({
      challengeId,
      userId,
      progressText,
      hoursSpent: parseFloat(hoursSpent),
      copyToPrepLogs: copyToPrepLogs || false,
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
        message: 'Challenge log created successfully',
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

const handleGetChallengeLogs = async (req: NextApiRequest, res: NextApiResponse) => {
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

    const result = await getChallengeLogsByIdFromDB(challengeId as string);

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
        message: 'Challenge logs fetched successfully',
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