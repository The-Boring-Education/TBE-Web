import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import { getPYUserByIdFromDB, updatePYUserByIdInDB } from '@/database';
import type { PrepYatraOnboardingPayload } from '@/interfaces';
import { connectDB } from '@/middlewares';
import { cors, sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);
  await connectDB();
  const { method } = req;

  switch (method) {
    case 'POST':
      return handleOnboarding(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};

const handleOnboarding = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      userId,
      name,
      username,
      goal,
      targetCompanies,
      preferredCategories,
      experienceLevel,
    }: PrepYatraOnboardingPayload = req.body;

    if (!userId || !name || !username || !goal) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Required fields: userId, name, username, goal',
        })
      );
    }

    console.log(req.body)

    const userResult = await getPYUserByIdFromDB(userId);
    if (userResult.error || !userResult.data) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: 'User not found',
        })
      );
    }
    const existingUser = userResult.data;

    if (existingUser.prepYatra?.pyOnboarded) {
      const updateResult = await updatePYUserByIdInDB(
        userId,
        {
          name,
          userName: username,
          'prepYatra.goal': goal,
          'prepYatra.targetCompanies': targetCompanies,
          'prepYatra.preferences.interviewCategories': preferredCategories,
          'prepYatra.preferences.focusAreas': targetCompanies,
          'prepYatra.experienceLevel': experienceLevel,
        }
      );
      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          data: {
            user: updateResult.data,
          },
          message: 'Onboarding preferences updated successfully',
        })
      );
    }

    const updateResult = await updatePYUserByIdInDB(
      userId,
      {
        name,
        userName: username,
        'prepYatra.pyOnboarded': true,
        'prepYatra.goal': goal,
        'prepYatra.targetCompanies': targetCompanies,
        'prepYatra.preferences.interviewCategories': preferredCategories,
        'prepYatra.preferences.focusAreas': targetCompanies,
        'prepYatra.experienceLevel': experienceLevel,
      }
    );
    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: {
          user: updateResult.data,
        },
        message: 'Onboarding completed successfully',
      })
    );
  } catch (error: any) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed during onboarding',
        error: error.message,
      })
    );
  }
};

export default handler;
