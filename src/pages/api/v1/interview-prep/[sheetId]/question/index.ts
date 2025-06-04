import type { NextApiRequest, NextApiResponse } from 'next';

import { addQuestionToInterviewSheetInDB } from '@/database';

import { apiStatusCodes } from '@/constant';
import type { AddInterviewQuestionRequestPayloadProps } from '@/interfaces';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  const { method, query } = req;
  const { sheetId } = query as { sheetId: string };

  switch (method) {
    case 'POST':
      return handleAddQuestion(req, res, sheetId);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};

const handleAddQuestion = async (
  req: NextApiRequest,
  res: NextApiResponse,
  sheetId: string
) => {
  const questionData = req.body as AddInterviewQuestionRequestPayloadProps;

  try {
    const { data, error } = await addQuestionToInterviewSheetInDB(
      sheetId,
      questionData
    );

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed while adding question to interview sheet',
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: 'Question added to interview sheet successfully',
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed while adding question to interview sheet',
      })
    );
  }
};

export default handler;
