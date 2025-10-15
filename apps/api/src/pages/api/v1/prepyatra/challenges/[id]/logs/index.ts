import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/lib/constants';
import {ChallengeLog} from '@/lib/database';
import {Challenge} from '@/lib/database';
import { cors } from '@/lib/utils';
import { sendAPIResponse } from '@/lib/utils';
import { connectDB } from '@/middleware';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);
  await connectDB();
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGetLogs(req, res);
    case 'POST':
      return handleCreateLog(req, res);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};

const handleGetLogs = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id: challengeId } = req.query;

    if (!challengeId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Challenge ID is required',
        })
      );
    }

    const logs = await ChallengeLog.find({ challenge: String(challengeId) })
      .sort({ day: 1 });
    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Logs retrieved successfully',
        data: logs,
      })
    );
  } catch (error) {
    console.error('Get Challenge Logs Error:', error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    );
  }
};

const handleCreateLog = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id: challengeId } = req.query;
    const { day, progressText, hoursSpent, nextGoals } = req.body;
    
    if (!challengeId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Challenge ID is required',
        })
      );
    }

    if (!day || !progressText || hoursSpent === undefined) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Day, progress text, and hours are required',
        })
      );
    }

    // Check if log already exists for this day
    const existingLog = await ChallengeLog.findOne({ 
      challenge: String(challengeId), 
      day: Number(day) 
    });

    if (existingLog) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Log already exists for this day',
        })
      );
    }

    const log = new ChallengeLog({
      challenge: String(challengeId),
      day: Number(day),
      progressText,
      hoursSpent: Number(hoursSpent),
      nextGoals: nextGoals || []
    });

    await log.save();

    // Update challenge current day
    await Challenge.findByIdAndUpdate(challengeId, {
      currentDay: Math.max(Number(day), req.body.currentDay || 0)
    });

    return res.status(apiStatusCodes.RESOURCE_CREATED).json(
      sendAPIResponse({
        status: true,
        message: 'Log created successfully',
        data: log,
      })
    );
  } catch (error) {
    console.error('Create Challenge Log Error:', error);
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
