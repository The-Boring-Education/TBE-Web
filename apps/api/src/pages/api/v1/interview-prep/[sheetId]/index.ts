import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/lib/constants';
import { getASheetForUserFromDB, updateInterviewSheetInDB } from '@/lib/database';
import type { AddInterviewSheetRequestPayloadProps } from '@/lib/interfaces';
import { sendAPIResponse } from '@/lib/utils';
import { connectDB } from '@/middleware';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  const { method, query } = req;
  const { sheetId, userId } = query as { sheetId: string; userId: string };

  switch (method) {
    case 'GET':
      return handleGetSheetById(req, res, userId, sheetId);
    case 'PATCH':
      return handleUpdateSheet(req, res, sheetId);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};

const handleGetSheetById = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
  sheetId: string
) => {
  try {
    const { data, error } = await getASheetForUserFromDB(userId, sheetId);

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed while fetching questions from the interview sheet',
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
        message: 'Failed while fetching questions from the interview sheet',
      })
    );
  }
};

const handleUpdateSheet = async (
  req: NextApiRequest,
  res: NextApiResponse,
  sheetId: string
) => {
  const updatedData = req.body as Partial<AddInterviewSheetRequestPayloadProps>;

  try {
    const { data, error } = await updateInterviewSheetInDB({
      updatedData,
      sheetId,
    });

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed while updating sheet',
          error,
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: 'Sheet updated successfully',
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed while updating sheet',
        error,
      })
    );
  }
};

export default handler;
