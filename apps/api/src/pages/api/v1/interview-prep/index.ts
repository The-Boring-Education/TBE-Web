import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/lib/constants';
import {
  addAInterviewSheetToDB,
  getAllInterviewSheetsFromDB,
  getInterviewSheetBySlugFromDB,
} from '@/lib/database';
import type { AddInterviewSheetRequestPayloadProps } from '@/lib/interfaces';
import { sendAPIResponse } from '@/lib/utils';
import { connectDB, cors } from '@/middleware';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);
  await connectDB();
  const { method } = req;

  switch (method) {
    case 'POST':
      return handleAddASheet(req, res);
    case 'GET':
      return handleAllGetSheet(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};

const handleAddASheet = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const sheetPayload = req.body as AddInterviewSheetRequestPayloadProps;

    const { error: sheetAlreadyExist } = await getInterviewSheetBySlugFromDB(
      sheetPayload.slug
    );

    if (!sheetAlreadyExist) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Sheet already exists',
        })
      );
    }

    const { data, error } = await addAInterviewSheetToDB(sheetPayload);

    if (error)
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Sheet not added',
          error,
        })
      );

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: 'Sheet added successfully',
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed while adding sheet',
        error,
      })
    );
  }
};

const handleAllGetSheet = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { slug } = req.query;
    const { userId } = req.query;
    if (slug) {
      const { data: sheet, error } = await getInterviewSheetBySlugFromDB(
        slug as string,
        userId as string
      );

      if (error || !sheet) {
        return res.status(apiStatusCodes.NOT_FOUND).json(
          sendAPIResponse({
            status: false,
            message: 'Sheet not found',
            error,
          })
        );
      }

      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          data: sheet,
        })
      );
    }

    // No slug? Return all sheets
    const { data: allSheets, error } = await getAllInterviewSheetsFromDB();

    if (error || !allSheets) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed while fetching sheets',
          error,
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: allSheets,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Unexpected error while fetching sheets',
        error,
      })
    );
  }
};

export default handler;
