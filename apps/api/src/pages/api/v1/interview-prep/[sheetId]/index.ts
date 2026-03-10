import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  deleteInterviewSheetFromDB,
  getASheetForUserFromDB,
  updateInterviewSheetInDB,
} from "@/lib/database";
import type { AddInterviewSheetRequestPayloadProps } from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils";
import { adminMiddleware, connectDB } from "@/middleware/api";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  const { method, query } = req;
  const { sheetId, userId } = query as { sheetId: string; userId: string };

  switch (method) {
    case "GET":
      return handleGetSheetById(req, res, userId, sheetId);
    case "PATCH":
      const isAdminPatch = await adminMiddleware(req, res);
      if (!isAdminPatch) return;
      return handleUpdateSheet(req, res, sheetId);
    case "DELETE":
      const isAdminDelete = await adminMiddleware(req, res);
      if (!isAdminDelete) return;
      return handleDeleteSheet(req, res, sheetId);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        }),
      );
  }
};

const handleGetSheetById = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
  sheetId: string,
) => {
  try {
    const { data, error } = await getASheetForUserFromDB(userId, sheetId);

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed while fetching questions from the interview sheet",
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: "Questions retrieved successfully",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed while fetching questions from the interview sheet",
      }),
    );
  }
};

const handleUpdateSheet = async (
  req: NextApiRequest,
  res: NextApiResponse,
  sheetId: string,
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
          message: "Failed while updating sheet",
          error,
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: "Sheet updated successfully",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed while updating sheet",
        error,
      }),
    );
  }
};

export default handler;

const handleDeleteSheet = async (
  req: NextApiRequest,
  res: NextApiResponse,
  sheetId: string,
) => {
  try {
    const { data, error } = await deleteInterviewSheetFromDB(sheetId);

    if (error) {
      if (error === "Interview sheet not found") {
        console.warn(`Sheet ${sheetId} not found for deletion`);
        return res.status(apiStatusCodes.NOT_FOUND).json(
          sendAPIResponse({
            status: false,
            message: "Interview sheet not found",
          }),
        );
      }

      console.error(`Error deleting sheet ${sheetId}:`, error);
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed to delete interview sheet",
          error,
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        success: true,
        message: "Interview sheet deleted successfully",
        data,
      }),
    );
  } catch (error) {
    console.error(`Exception deleting sheet ${sheetId}:`, error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to delete interview sheet",
        error: String(error),
      }),
    );
  }
};
