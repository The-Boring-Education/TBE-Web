import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import {
  deleteQuestionFromSheetInDB,
  updateInterviewQuestionInDB,
} from '@/database';
import type { AddInterviewQuestionRequestPayloadProps } from '@/interfaces';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  const { method, query } = req;
  const { sheetId, questionId } = query as {
    questionId: string;
    sheetId: string;
  };

  switch (method) {
    case 'PATCH':
      return handleUpdateQuestion(req, res, sheetId, questionId);
    case 'DELETE':
      return handleDeleteQuestion(req, res, sheetId, questionId);

    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};

const handleUpdateQuestion = async (
  req: NextApiRequest,
  res: NextApiResponse,
  sheetId: string,
  questionId: string
) => {
  const updatedData =
    req.body as Partial<AddInterviewQuestionRequestPayloadProps>;

  try {
    const { data, error } = await updateInterviewQuestionInDB(
      sheetId,
      questionId,
      updatedData
    );

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed while updating chapter to section',
        })
      );
    }

    return res
      .status(apiStatusCodes.OKAY)
      .json(sendAPIResponse({ status: true, data }));
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed while updating chapter to section',
      })
    );
  }
};

const handleDeleteQuestion = async (
  req: NextApiRequest,
  res: NextApiResponse,
  sheetId: string,
  questionId: string
) => {
  try {
    const { data, error } = await deleteQuestionFromSheetInDB(
      sheetId,
      questionId
    );

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed while deleting chapter to section',
        })
      );
    }

    return res
      .status(apiStatusCodes.OKAY)
      .json(sendAPIResponse({ status: true, data }));
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed while deleting chapter to section',
      })
    );
  }
};

export default handler;
