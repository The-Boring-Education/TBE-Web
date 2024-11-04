import { apiStatusCodes } from '@/constant';
import { NextApiRequest, NextApiResponse } from 'next';
import { sendAPIResponse } from '@/utils';
import { connectDB } from '@/middlewares';
import { markQuestionCompletedByUser, getAllQuestionsByUser } from '@/database';
import {
  MarkQuestionCompletedRequestProps,
  GetAllQuestionsRequestProps,
} from '@/interfaces';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();

    const { method } = req;

    switch (method) {
      case 'PATCH':
        return handleMarkQuestionCompleted(req, res);
      case 'GET':
        return handleGetAllQuestions(req, res);
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
        message: `Something went wrong`,
        error,
      })
    );
  }
};

const handleMarkQuestionCompleted = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { userId, sheetId, questionId, isCompleted } =
    req.body as MarkQuestionCompletedRequestProps;

  try {
    const { data, error } = await markQuestionCompletedByUser(
      userId,
      sheetId,
      questionId,
      isCompleted
    );

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed to update question status',
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: 'Question status updated successfully',
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed to update question status',
        error,
      })
    );
  }
};

const handleGetAllQuestions = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { userId } = req.query as unknown as GetAllQuestionsRequestProps;

  try {
    const { data, error } = await getAllQuestionsByUser(userId);

    if (error || !data) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed to retrieve questions',
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: 'Questions retrieved successfully',
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed to retrieve questions',
        error,
      })
    );
  }
};

export default handler;
