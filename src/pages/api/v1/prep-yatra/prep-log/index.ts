import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import {
  addPrepLogToDB,
  deletePrepLogInDB,
  getPrepLogsByUserFromDB,
  updatePrepLogInDB,
  handleGamificationPoints,
} from '@/database';
import { connectDB } from '@/middlewares';
import { cors, sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);
  await connectDB();

  switch (req.method) {
    case 'POST':
      return handleAddLog(req, res);
    case 'GET':
      return handleGetLogs(req, res);
    case 'PUT':
      return handleUpdateLog(req, res);
    case 'DELETE':
      return handleDeleteLog(req, res);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} not allowed`,
        })
      );
  }
};

const handleAddLog = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId, title, description, timeSpent } = req.body;

    if (!userId || !title || !timeSpent) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'userId, title, and durationDays are required',
        })
      );
    }

    const { data, error } = await addPrepLogToDB({
      userId,
      title,
      description,
      timeSpent,
    });

    if (error) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: error,
        })
      );
    }

    // Trigger gamification for preplog creation
    try {
      await handleGamificationPoints(true, userId, 'PREPLOG_CREATED');
    } catch (gamificationError) {
      console.error('Gamification trigger failed:', gamificationError);
      // Don't fail the main request if gamification fails
    }

    return res.status(apiStatusCodes.RESOURCE_CREATED).json(
      sendAPIResponse({
        status: true,
        message: 'Prep log created',
        data,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Something went wrong while creating recruiter',
        error,
      })
    );
  }
};

const handleGetLogs = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json(
        sendAPIResponse({
          status: false,
          message: 'Missing or invalid userId',
        })
      );
    }

    const { data, error } = await getPrepLogsByUserFromDB(userId);

    if (error) {
      return res.status(500).json(
        sendAPIResponse({
          status: false,
          message: error,
        })
      );
    }

    return res.status(200).json(
      sendAPIResponse({
        status: true,
        data,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Something went wrong while creating recruiter',
        error,
      })
    );
  }
};

const handleUpdateLog = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { prepLogId, ...updatePayload } = req.body;

    if (!prepLogId) {
      return res.status(400).json(
        sendAPIResponse({
          status: false,
          message: 'prepLogId is required',
        })
      );
    }

    const { data, error } = await updatePrepLogInDB(prepLogId, updatePayload);

    if (error) {
      return res.status(400).json(
        sendAPIResponse({
          status: false,
          message: error,
        })
      );
    }

    return res.status(200).json(
      sendAPIResponse({
        status: true,
        message: 'Prep log updated',
        data,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Something went wrong while creating recruiter',
        error,
      })
    );
  }
};

const handleDeleteLog = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { prepLogId } = req.query;

    if (!prepLogId || typeof prepLogId !== 'string') {
      return res.status(400).json(
        sendAPIResponse({
          status: false,
          message: 'Invalid prepLogId',
        })
      );
    }

    const { data, error } = await deletePrepLogInDB(prepLogId);

    if (error) {
      return res.status(404).json(
        sendAPIResponse({
          status: false,
          message: 'Log not found',
        })
      );
    }

    return res.status(200).json(
      sendAPIResponse({
        status: true,
        message: 'Prep log deleted',
        data,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Something went wrong while creating recruiter',
        error,
      })
    );
  }
};

export default handler;
