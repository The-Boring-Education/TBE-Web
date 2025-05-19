import { apiStatusCodes } from '@/constant';
import { NextApiRequest, NextApiResponse } from 'next';
import { sendAPIResponse } from '@/utils';
import { connectDB } from '@/middlewares';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

import { createFeedback, updateFeedbackText } from '@/database';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();

    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(apiStatusCodes.UNAUTHORIZED).json(
        sendAPIResponse({
          status: false,
          message: 'Unauthorized',
        })
      );
    }

    const userId = session.user.id;
    const { method } = req;

    switch (method) {
      case 'POST':
        return handlePostFeedback(req, res, userId);
      case 'PUT':
        return handleUpdateDetailedFeedback(req, res, userId);
      default:
        return res.status(apiStatusCodes.BAD_REQUEST).json(
          sendAPIResponse({
            status: false,
            message: `Method ${method} Not Allowed`,
          })
        );
    }
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Something went wrong',
        error,
      })
    );
  }
};

const handlePostFeedback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  try {
    const { rating, type, ref } = req.body;

    if (!rating || !type) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Rating and type are required',
        })
      );
    }

    const newFeedback = await createFeedback({ rating, type, ref, userId });

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Star rating submitted. You can add detailed feedback later.',
        data: { feedbackId: newFeedback._id },
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed to submit star rating',
        error,
      })
    );
  }
};

const handleUpdateDetailedFeedback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  try {
    const { feedbackId, feedback } = req.body;

    if (!feedbackId || !feedback) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'feedbackId and feedback are required',
        })
      );
    }

    const updatedFeedback = await updateFeedbackText({ feedbackId, userId, feedback });

    if (!updatedFeedback) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: 'Feedback not found or you do not have permission to update it',
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Detailed feedback updated successfully',
        data: updatedFeedback,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed to update detailed feedback',
        error,
      })
    );
  }
};

export default handler;
