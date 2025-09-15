import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import { User } from '@/database';
import PrepYatraSubscription from '@/database/models/PrepYatra/Subscription';
import type { CreateSubscriptionPayload } from '@/interfaces';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';

/**
 * API Handler for PrepYatra subscriptions
 * POST /api/v1/prepyatra/subscription - Create subscription
 * GET /api/v1/prepyatra/subscription?userId={userId} - Get user subscription status
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  const { method } = req;

  switch (method) {
    case 'POST':
      return handleCreateSubscription(req, res);
    case 'GET':
      return handleGetSubscription(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};

const handleCreateSubscription = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { userId, type, amount, duration }: CreateSubscriptionPayload =
      req.body;

    if (!userId || !type || !amount || !duration) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Required fields: userId, type, amount, duration',
        })
      );
    }

    // Calculate expiry date based on type
    let expiryDate: Date;
    if (type === 'Lifetime') {
      expiryDate = new Date('2099-12-31'); // Far future for lifetime
    } else {
      expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + duration);
    }

    // Default features based on subscription type
    const features = [
      'InterviewQuestions',
      'SystemDesignResources',
      'DSAResources',
      'ResumeWorkshop',
      'JobApplicationWorkshop',
    ];

    if (type === 'Lifetime') {
      features.push('ColdEmailAutomation', 'LinkedInAutomation');
    }

    // Create subscription
    const subscription = await PrepYatraSubscription.create({
      userId,
      type,
      amount,
      duration,
      expiryDate,
      features,
    });

    // Update user subscription status
    await User.updateOne(
      { userId },
      {
        subscriptionStatus: 'Active',
        subscriptionExpiry: expiryDate,
      }
    );

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: subscription,
        message: 'Subscription created successfully',
      })
    );
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed to create subscription',
        error: error.message,
      })
    );
  }
};

const handleGetSubscription = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { userId } = req.query as { userId: string };

    if (!userId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'User ID is required',
        })
      );
    }

    // Get user's active subscription
    const subscription = await PrepYatraSubscription.findOne({
      userId,
      isActive: true,
      expiryDate: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    // Get PrepYatra user data
    const prepYatraUser = await User.findOne({
      userId,
    });

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: {
          subscription,
          user: prepYatraUser,
          hasActiveSubscription: !!subscription,
        },
        message: 'Subscription status retrieved successfully',
      })
    );
  } catch (error: any) {
    console.error('Error getting subscription:', error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed to get subscription status',
        error: error.message,
      })
    );
  }
};

export default handler;
