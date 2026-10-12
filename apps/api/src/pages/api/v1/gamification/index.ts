import { classifyPointAction } from "@tbe/constants";
import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes, USER_POINTS_ACTION } from "@/lib/constants";
import {
  addGamificationDocInDB,
  getUserPointsFromDB,
  updateUserPointsInDB,
} from "@/lib/database";
import type { UserPointsActionType } from "@/lib/interfaces";
import { withApiHandler } from "@/middleware/requestLogger";
import { getAuthenticatedUserId, verifyOwnership } from "@/middleware/userAuth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!["GET", "POST"].includes(req.method ?? "")) {
    return res.status(apiStatusCodes.BAD_REQUEST).json({
      success: false,
      message: `Method ${req.method} not allowed`,
    });
  }

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

/**
 * POST /api/v1/gamification?userId=
 *
 * Browsers may only claim Engagement Actions, and only for themselves. Learning
 * Actions are awarded server-side by the endpoint that verified the learning.
 */
const handleUpdateGamificationRecord = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
) => {
  const authenticatedUserId = getAuthenticatedUserId(req, res);
  if (!authenticatedUserId) return;
  if (!verifyOwnership(authenticatedUserId, userId, res)) return;

  const { actionType } = (req.body ?? {}) as { actionType?: unknown };

  if (
    typeof actionType !== "string" ||
    !USER_POINTS_ACTION.includes(actionType as UserPointsActionType)
  ) {
    return res.status(apiStatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Missing or invalid actionType",
    });
  }

  if (classifyPointAction(actionType) !== "ENGAGEMENT") {
    return res.status(apiStatusCodes.FORBIDDEN).json({
      success: false,
      message: "Learning actions are awarded by the server",
    });
  }

  const result = await updateUserPointsInDB(
    userId,
    actionType as UserPointsActionType,
  );
  if (result.error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update gamification record",
    });
  }
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
