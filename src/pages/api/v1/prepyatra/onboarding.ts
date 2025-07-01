import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import PrepYatraUser from '@/database/models/PrepYatra/User';
import User from '@/database/models/User';
import type { PrepYatraOnboardingPayload } from '@/interfaces';
import { connectDB } from '@/middlewares';
import { cors, sendAPIResponse } from '@/utils';

/**
 * API Handler for PrepYatra user onboarding
 * POST /api/v1/prepyatra/onboarding
 * GET /api/v1/prepyatra/onboarding
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);
  await connectDB();
  const { method } = req;

  switch (method) {
    case 'POST':
      return handleOnboarding(req, res);
    case 'GET':
      return getOnboardingDetails(req, res);
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
      supabaseUserId,
      name,
      username,
      goal,
      targetCompanies,
      preferredCategories,
    }: PrepYatraOnboardingPayload = req.body;

    if (!supabaseUserId || !name || !username || !goal) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Required fields: supabaseUserId, name, username, goal',
        })
      );
    }

    // First, create or find the MongoDB user
    let mongoUser = await User.findOne({
      $or: [
        { providerAccountId: supabaseUserId },
        { email: `${username}@prepyatra.temp` }, // Temporary email for Supabase users
      ],
    });

    if (!mongoUser) {
      mongoUser = await User.create({
        name,
        userName: username,
        email: `${username}@prepyatra.temp`,
        provider: 'supabase',
        providerAccountId: supabaseUserId,
        isOnboarded: true,
      });
    }

    // Check if PrepYatra user already exists
    const existingPrepYatraUser = await PrepYatraUser.findOne({
      supabaseUserId,
    });

    if (existingPrepYatraUser) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'User already onboarded',
        })
      );
    }

    // Create PrepYatra user profile
    const prepYatraUser = await PrepYatraUser.create({
      supabaseUserId,
      mongoUserId: mongoUser._id,
      goal,
      targetCompanies,
      subscriptionStatus: 'Trial',
      subscriptionExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
      preferences: {
        interviewCategories: preferredCategories,
        focusAreas: targetCompanies,
      },
    });

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: {
          prepYatraUser,
          mongoUserId: mongoUser._id,
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

const getOnboardingDetails = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'userId is required as a query parameter',
        })
      );
    }

    // Find the PrepYatra user by userId (you can change this field based on your database)
    const prepYatraUser = await PrepYatraUser.findOne({
      $or: [
        { supabaseUserId: userId },
        { mongoUserId: userId },
        { _id: userId }
      ]
    }).select('goal targetCompanies preferences subscriptionStatus subscriptionExpiry');

    if (!prepYatraUser) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: 'User not found or not onboarded',
        })
      );
    }

    // Prepare the response data
    const onboardingDetails = {
      goal: prepYatraUser.goal,
      targetCompanies: prepYatraUser.targetCompanies,
      interviewCategories: prepYatraUser.preferences?.interviewCategories || [],
      focusAreas: prepYatraUser.preferences?.focusAreas || [],
      subscriptionStatus: prepYatraUser.subscriptionStatus,
    };

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: onboardingDetails,
        message: 'Onboarding details retrieved successfully',
      })
    );
  } catch (error: any) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed to retrieve onboarding details',
        error: error.message,
      })
    );
  }
};


export default handler;
