import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/lib/constants';
import {Payment, PrepYatraSubscription} from '@/lib/database';
import { connectDB } from '@/middleware';
import { sendAPIResponse } from '@/lib/utils';
import { cors } from '@/lib/utils';

interface PopulatedPayment {
  _id: any;
  amount: number;
  createdAt?: Date;
  user?: {
    name?: string;
    email?: string;
  };
  productType?: string;
  orderId?: string;
}

interface PopulatedSubscription {
  _id: any;
  amount: number;
  createdAt?: Date;
  userId?: {
    name?: string;
    email?: string;
  };
  type?: string;
}

/**
 * API Handler for revenue transparency data
 * GET /api/v1/revenue/transparency - Get recent transactions and total revenue
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Apply CORS headers
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await connectDB();
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGetRevenueData(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};

const handleGetRevenueData = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    // Get all successful payments from both regular payments and subscriptions
    const regularPayments = (await Payment.find({ isPaid: true })
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .select('amount createdAt user productType orderId')
      .lean()) as PopulatedPayment[];

    const subscriptionPayments = (await PrepYatraSubscription.find({
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .select('amount createdAt userId type')
      .lean()) as PopulatedSubscription[];

    // Combine and format all payments
    const allPayments = [
      ...regularPayments.map((payment) => ({
        id: payment._id,
        amount: payment.amount,
        date: payment.createdAt || new Date(),
        user: payment.user,
        type: payment.productType || 'TBE_Course',
        orderId: payment.orderId,
      })),
      ...subscriptionPayments.map((subscription) => ({
        id: subscription._id,
        amount: subscription.amount,
        date: subscription.createdAt || new Date(),
        user: subscription.userId,
        type: 'PrepYatra_Subscription',
        subscriptionType: subscription.type,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate total revenue
    const totalRevenue = allPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    // Check if we meet the visibility criteria
    const shouldShowData = allPayments.length >= 5 && totalRevenue >= 2000;

    if (!shouldShowData) {
      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          data: {
            showData: false,
            message: 'Revenue data not yet available for public display',
          },
          message: 'Revenue transparency criteria not met',
        })
      );
    }

    // Get last 5 transactions for display
    const recentTransactions = allPayments.slice(0, 5).map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      date: payment.date,
      type: payment.type,
      // Anonymize user data for privacy
      userInitials: payment.user?.name
        ? payment.user.name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
        : 'U',
    }));

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: {
          showData: true,
          totalRevenue,
          totalTransactions: allPayments.length,
          recentTransactions,
          stats: {
            totalPrepYatraRevenue: subscriptionPayments.reduce(
              (sum, sub) => sum + sub.amount,
              0
            ),
            totalTBERevenue: regularPayments.reduce(
              (sum, payment) => sum + payment.amount,
              0
            ),
            totalPrepYatraSubscriptions: subscriptionPayments.length,
            totalTBEPurchases: regularPayments.length,
          },
        },
        message: 'Revenue data retrieved successfully',
      })
    );
  } catch (error: any) {
    console.error('Error getting revenue data:', error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed to get revenue data',
        error: error.message,
      })
    );
  }
};

export default handler;
