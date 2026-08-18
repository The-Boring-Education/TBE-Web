import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  getUserByIdFromDB,
  updateUserPersonalizationInDB,
} from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { isMongoObjectIdString } from "@/lib/validation/mongodb";
import { withUserAuth } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "GET":
      return withUserAuth(
        async (req, res) => handleGetPersonalization(req, res),
        {
          ownerRequired: true,
        },
      )(req, res);
    case "POST":
    case "PATCH":
    case "PUT":
      return withUserAuth(
        async (req, res) => handleUpdatePersonalization(req, res),
        { ownerRequired: true },
      )(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${method} Not Allowed`,
        }),
      );
  }
};

const handleGetPersonalization = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const userId = (req.query.userId as string) || (req.body?.userId as string);

    if (!userId || !isMongoObjectIdString(userId)) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Valid userId is required",
        }),
      );
    }

    const { data: user, error } = await getUserByIdFromDB(userId);
    if (error || !user) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: "User not found",
          error,
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: user.personalization || {
          isCompleted: false,
          interests: [],
          experienceLevel: "",
          weeklyCommitment: "",
          skipped: false,
        },
        message: "User personalization fetched successfully",
      }),
    );
  } catch (error: any) {
    logger.error("GET /api/v1/user/personalization error", { error });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to fetch personalization",
        error: error?.message || String(error),
      }),
    );
  }
};

const handleUpdatePersonalization = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const {
      userId,
      interests,
      experienceLevel,
      weeklyCommitment,
      skipped,
      isCompleted,
    } = req.body;

    if (!userId || !isMongoObjectIdString(userId)) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Valid userId is required",
        }),
      );
    }

    const { data, error } = await updateUserPersonalizationInDB(userId, {
      interests: Array.isArray(interests) ? interests : undefined,
      experienceLevel:
        typeof experienceLevel === "string" ? experienceLevel : undefined,
      weeklyCommitment:
        typeof weeklyCommitment === "string" ? weeklyCommitment : undefined,
      skipped: typeof skipped === "boolean" ? skipped : undefined,
      isCompleted: typeof isCompleted === "boolean" ? isCompleted : undefined,
    });

    if (error) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Error updating personalization",
          error,
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: "Personalization saved successfully",
      }),
    );
  } catch (error: any) {
    logger.error("POST /api/v1/user/personalization error", { error });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to update personalization",
        error: error?.message || String(error),
      }),
    );
  }
};

export default withApiHandler(handler);
