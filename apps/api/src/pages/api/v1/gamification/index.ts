import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  addGamificationDocInDB,
  getUserPointsFromDB,
  updateUserPointsInDB,
} from "@/lib/database";
import type { UserPointsActionType } from "@/lib/interfaces";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { query } = req;
  const { userId } = query;

  if (typeof userId !== "string" || !userId.trim()) {
    return res.status(apiStatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Invalid or missing userId",
    });
  }

  switch (req.method) {
    case "GET":
      return handleGetUserGamificationRecords(req, res, userId);
    case "POST":
      return handleUpdateGamificationRecord(req, res, userId);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Method ${req.method} not allowed`,
      });
  }
};

const handleUpdateGamificationRecord = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
) => {
  const { body } = req;
  const { actionType } = body as { actionType: UserPointsActionType };

  if (!actionType) {
    return res.status(apiStatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Missing required fields",
    });
  }

  const result = await updateUserPointsInDB(userId, actionType);
  return res.status(apiStatusCodes.OKAY).json({
    success: true,
    message: "Gamification record updated successfully",
    data: result,
  });
};

const handleGetUserGamificationRecords = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
) => {
  const { data, error } = await getUserPointsFromDB(userId);

  // Add gamification record if not found
  if (error) {
    const { data } = await addGamificationDocInDB(userId);

    return res.status(apiStatusCodes.OKAY).json({
      success: true,
      message: "Gamification record created successfully",
      data,
    });
  }

  return res.status(apiStatusCodes.OKAY).json({
    success: true,
    message: "Gamification records fetched successfully",
    data,
  });
};

export default withApiHandler(handler);
