import { apiStatusCodes } from '@/constant';
import { NextApiRequest, NextApiResponse } from 'next';
import { sendAPIResponse } from '@/utils';
import { connectDB } from '@/middlewares';
import { addFeedbackToDB, updateFeedbackTextInDB } from '@/database';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();

    switch (req.method) {
      case 'POST':
        return await handlePostFeedback(req, res);
      case 'PUT':
        return await handleUpdateFeedback(req, res);
      default:
        return res.status(apiStatusCodes.BAD_REQUEST).json(
          sendAPIResponse({
            status: false,
            message: `Method ${req.method} Not Allowed`,
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

const handlePostFeedback = async (req: NextApiRequest, res: NextApiResponse) => {
  const { rating, type, ref, userId } = req.body;

  if (!rating || !type || !userId) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: 'Rating, type, and userId are required',
      })
    );
  }

  const { data, error } = await addFeedbackToDB({ rating, type, ref, userId });

  if (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed to submit star rating',
        error,
      })
    );
  }

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      message: 'Star rating submitted. You can add detailed feedback later.',
      data: { feedbackId: data?._id },
    })
  );
};

const handleUpdateFeedback = async (req: NextApiRequest, res: NextApiResponse) => {
  const { feedbackId, feedback, userId } = req.body;

  if (!feedbackId || !feedback || !userId) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: 'feedbackId, feedback, and userId are required',
      })
    );
  }

  const { data, error } = await updateFeedbackTextInDB({ feedbackId, userId, feedback });

  if (error) {
    return res.status(apiStatusCodes.NOT_FOUND).json(
      sendAPIResponse({
        status: false,
        message: error,
      })
    );
  }

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      message: 'Detailed feedback updated successfully',
      data,
    })
  );
};

export default handler;
