import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import { User } from '@/database';
import { connectDB } from '@/middlewares';
import { cors, sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);
  await connectDB();

  switch (req.method) {
    case 'GET':
      return handleGetUsersForReminder(req, res);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} not allowed`,
        })
      );
  }
};

const handleGetUsersForReminder = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { reminderType = 'daily' } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let usersNeedingReminder;

    if (reminderType === 'daily') {
      // Find users who haven't logged today
      usersNeedingReminder = await User.find({
        'prepYatra.pyOnboarded': true,
        $or: [
          { 'prepYatra.prepLog.lastLoggedDate': { $exists: false } },
          { 'prepYatra.prepLog.lastLoggedDate': { $lt: today } },
        ],
      }).select('_id name email prepYatra.prepLog');
    } else if (reminderType === 'streak_risk') {
      // Find users with active streaks who haven't logged today
      usersNeedingReminder = await User.find({
        'prepYatra.pyOnboarded': true,
        'prepYatra.prepLog.currentStreak': { $gte: 3 },
        'prepYatra.prepLog.lastLoggedDate': { $lt: today },
      }).select('_id name email prepYatra.prepLog');
    } else if (reminderType === 'streak_broken') {
      // Find users whose streak was broken yesterday
      usersNeedingReminder = await User.find({
        'prepYatra.pyOnboarded': true,
        'prepYatra.prepLog.currentStreak': 0,
        'prepYatra.prepLog.lastLoggedDate': { $lt: yesterday },
        'prepYatra.prepLog.totalLogs': { $gt: 0 },
      }).select('_id name email prepYatra.prepLog');
    } else if (reminderType === 'inactive') {
      // Find users who haven't logged in the last 3 days
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      usersNeedingReminder = await User.find({
        'prepYatra.pyOnboarded': true,
        $or: [
          { 'prepYatra.prepLog.lastLoggedDate': { $exists: false } },
          { 'prepYatra.prepLog.lastLoggedDate': { $lt: threeDaysAgo } },
        ],
      }).select('_id name email prepYatra.prepLog');
    }

    const reminderData =
      usersNeedingReminder?.map((user) => ({
        userId: user._id,
        name: user.name,
        email: user.email,
        prepLogStats: user.prepYatra?.prepLog || {
          currentStreak: 0,
          longestStreak: 0,
          totalLogs: 0,
          lastLoggedDate: null,
        },
      })) || [];

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: {
          reminderType,
          usersCount: reminderData.length,
          users: reminderData,
        },
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Something went wrong while fetching users for reminder',
        error,
      })
    );
  }
};

export default handler;
