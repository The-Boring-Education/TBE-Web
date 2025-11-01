import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/lib/constants';
import {Challenge, ChallengeLog} from '@/lib/database';
import { cors } from '@/lib/utils';
import { sendAPIResponse } from '@/lib/utils';
import { connectDB } from '@/middleware';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await connectDB();
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGetProgress(req, res);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};

const handleGetProgress = async (req: NextApiRequest, res: NextApiResponse) => {
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

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: 'Challenge not found',
        })
      );
    }

    const logs = await ChallengeLog.find({ challenge: String(challengeId) })
      .sort({ day: 1 });

    // Calculate progress
    const totalHours = logs.reduce((sum, log) => sum + (log.hoursSpent || 0), 0);
    const completedDays = logs.length;
    const progressPercentage = (completedDays / challenge.totalDays) * 100;

    // Calculate streak
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    for (let i = 1; i <= challenge.totalDays; i++) {
      const log = logs.find(l => l.day === i);
      if (log) {
        tempStreak++;
        currentStreak = tempStreak;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    const progress = {
      challengeId: String(challengeId),
      totalDays: challenge.totalDays,
      completedDays,
      currentDay: challenge.currentDay,
      progressPercentage: Math.round(progressPercentage * 100) / 100,
      totalHours,
      currentStreak,
      maxStreak,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      isActive: challenge.isActive
    };

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Progress retrieved successfully',
        data: progress,
      })
    );
  } catch (error) {
    console.error('Get Challenge Progress Error:', error);
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
