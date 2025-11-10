import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/lib/constants';
import {
  getStarredQuestionsFromDB,
  markQuestionStarredByUser,
} from '@/lib/database';
import type { MarkQuestionStarredRequestProps } from '@/lib/interfaces';
import { sendAPIResponse } from '@/lib/utils';
import { connectDB } from '@/middleware';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();

    switch (req.method) {
      case 'POST':
        return handleStarQuestion(req, res);
      case 'GET':
        return handleGetStarredQuestions(req, res);
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
        message: 'Internal Server Error',
      })
    );
  }
};

const handleStarQuestion = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { userId, sheetId, questionId, isStarred } =
    req.body as MarkQuestionStarredRequestProps;

  if (!userId || !sheetId || !questionId || typeof isStarred !== 'boolean') {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: 'Invalid Data sent in request',
      })
    );
  }

  try {
    const { data: starredQuestion, error: starQuestionError } =
      await markQuestionStarredByUser(userId, sheetId, questionId, isStarred);

    if (starQuestionError === 'User or question not found') {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: 'User or question not found',
        })
      );
    }
    if (starQuestionError) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: starQuestionError || 'Failed to mark question as starred',
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: isStarred
          ? 'Question marked as starred'
          : 'Question unstarred',
        data: starredQuestion,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Unexpected error occurred while starring question',
        error,
      })
    );
  }
};

const handleGetStarredQuestions = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { userId, sheetId } = req.body as MarkQuestionStarredRequestProps;

  if (!userId || !sheetId) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: 'Invalid Data sent in request',
      })
    );
  }

  try {
    const { data: starredQuestions, error: getStarredQuestionsError } =
      await getStarredQuestionsFromDB(userId, sheetId);

    if (getStarredQuestionsError) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message:
            getStarredQuestionsError || 'Failed to get starred questions',
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Starred questions fetched successfully',
        data: starredQuestions,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Unexpected error occurred while getting starred questions',
        error,
      })
    );
  }
};

export default handler;
