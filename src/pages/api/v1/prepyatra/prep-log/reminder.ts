import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import { addANotificationToDB, getUserPrepLogStats } from '@/database';
import { connectDB } from '@/middlewares';
import { cors, sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);
  await connectDB();

  switch (req.method) {
    case 'POST':
      return handleSendPrepLogReminder(req, res);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} not allowed`,
        })
      );
  }
};

const handleSendPrepLogReminder = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { userId, reminderType = 'daily' } = req.body;

    if (!userId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'userId is required',
        })
      );
    }

    // Get user's prep log stats to personalize the reminder
    const { data: stats, error: statsError } = await getUserPrepLogStats(userId);
    
    if (statsError) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: statsError,
        })
      );
    }

    // Generate personalized reminder message
    const reminderMessage = generateReminderMessage(stats, reminderType);

    // Add notification to database
    const notificationPayload = {
      type: 'PREP YATRA' as const,
      text: reminderMessage.text,
      isHTML: false,
      link: 'https://prepyatra.netlify.app/prep-log',
      isExternalLink: true,
    };

    const { data, error } = await addANotificationToDB(notificationPayload);

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed to create reminder notification',
          error,
        })
      );
    }

    return res.status(apiStatusCodes.RESOURCE_CREATED).json(
      sendAPIResponse({
        status: true,
        message: 'Prep log reminder sent successfully',
        data: {
          notification: data,
          userStats: stats,
          reminderType: reminderMessage.type,
        },
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Something went wrong while sending prep log reminder',
        error,
      })
    );
  }
};

const generateReminderMessage = (stats: any, reminderType: string) => {
  const { currentStreak, hasLoggedToday, totalLogs, longestStreak } = stats;

  if (hasLoggedToday) {
    return {
      type: 'congratulation',
      text: `🎉 Great job! You've logged your progress today. Current streak: ${currentStreak} days! Keep the momentum going tomorrow.`,
    };
  }

  if (reminderType === 'streak_broken' && currentStreak === 0 && totalLogs > 0) {
    return {
      type: 'streak_recovery',
      text: `💪 Don't let yesterday break your momentum! Your longest streak was ${longestStreak} days. Start a new streak today and beat your record!`,
    };
  }

  if (currentStreak >= 7) {
    return {
      type: 'streak_encouragement',
      text: `🔥 You're on fire! ${currentStreak} days streak! Don't break the chain - log your progress today and keep climbing!`,
    };
  }

  if (totalLogs === 0) {
    return {
      type: 'first_time',
      text: `🚀 Ready to start your interview prep journey? Log your first progress today and begin building your success story!`,
    };
  }

  // Default daily reminder
  return {
    type: 'daily',
    text: `📚 Time to level up! Log today's interview prep progress and continue building your path to success. Every step counts!`,
  };
};

export default handler;