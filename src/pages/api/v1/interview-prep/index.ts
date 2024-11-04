import { apiStatusCodes } from '@/constant';
import { NextApiRequest, NextApiResponse } from 'next';
import { sendAPIResponse } from '@/utils';
import { connectDB } from '@/middlewares';
import {
  addAInterviewSheetToDB,
  getAllInterviewSheetsFromDB,
  getInterviewSheetBySlugFromDB,
} from '@/database';
import {
  AddInterviewSheetRequestPayloadProps,
  BaseInterviewSheetResponseProps,
} from '@/interfaces';
import mongoose from 'mongoose';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
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
    let allSheetsResponse: BaseInterviewSheetResponseProps[] = [];

    // Fetch all sheets
    const { data: allSheets, error: allSheetsError } =
      await getAllInterviewSheetsFromDB();

    if (allSheetsError || !allSheets) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed while fetching sheets',
          error: allSheetsError,
        })
      );
    }

    // Create a map of all sheets by their ID
    const sheetMap = new Map<string, BaseInterviewSheetResponseProps>(
      allSheets.map((sheet: BaseInterviewSheetResponseProps) => {
        const sheetDoc = sheet as unknown as mongoose.Document &
          BaseInterviewSheetResponseProps;
        return [sheetDoc._id.toString(), { ...sheetDoc.toObject() }];
      })
    );

    // If the user is logged in, fetch enrolled sheets and mark them in the map
    // TODO: Implement this feature

    // Convert the map back to an array to prepare the final response
    allSheetsResponse = Array.from(sheetMap.values());

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: allSheetsResponse,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed while fetching sheets',
        error,
      })
    );
  }
};

export default handler;
