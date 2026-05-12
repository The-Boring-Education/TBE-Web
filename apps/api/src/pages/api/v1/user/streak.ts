import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes, TBE_APP } from "@/lib/constants";
import { getUserStreakFromDB, logUserActivityForStreak } from "@/lib/database";
import type { TBEAppType, UserPointsActionType } from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      return handleGetStreak(req, res);
    case "POST":
      return handleLogActivity(req, res);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} not allowed`,
        }),
      );
  }
};

/**
 * GET /api/v1/user/streak?userId=<id>&app=<app>
 *
 * Returns:
 * - currentStreak  – consecutive days ending today or yesterday
 * - longestStreak  – all-time (or per-app if ?app provided)
 * - last30Days     – array of { date, hasActivity, apps[] }
 * - totalActiveDays
 */
const handleGetStreak = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId, app } = req.query;

  if (typeof userId !== "string" || !userId.trim()) {
    return res
      .status(apiStatusCodes.BAD_REQUEST)
      .json(
        sendAPIResponse({
          status: false,
          message: "Missing or invalid userId",
        }),
      );
  }

  const appFilter =
    typeof app === "string" && TBE_APP.includes(app as TBEAppType)
      ? (app as TBEAppType)
      : undefined;

  try {
    const { data, error } = await getUserStreakFromDB(userId, appFilter);

    if (error) {
      return res
        .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
        .json(sendAPIResponse({ status: false, message: error }));
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Streak data fetched successfully",
        data,
      }),
    );
  } catch (error) {
    logger.error("Streak GET API error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res
      .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        sendAPIResponse({ status: false, message: "Internal server error" }),
      );
  }
};

/**
 * POST /api/v1/user/streak
 * Body: { userId, app, actionType, metadata? }
 *
 * Logs a learning activity for streak tracking.
 */
const handleLogActivity = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId, app, actionType, metadata } = req.body as {
      userId: string;
      app: TBEAppType;
      actionType: UserPointsActionType;
      metadata?: Record<string, unknown>;
    };

    if (typeof userId !== "string" || !userId.trim()) {
      return res
        .status(apiStatusCodes.BAD_REQUEST)
        .json(
          sendAPIResponse({
            status: false,
            message: "Missing or invalid userId",
          }),
        );
    }

    if (!app || !TBE_APP.includes(app)) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Invalid app. Must be one of: ${TBE_APP.join(", ")}`,
        }),
      );
    }

    if (!actionType) {
      return res
        .status(apiStatusCodes.BAD_REQUEST)
        .json(
          sendAPIResponse({ status: false, message: "Missing actionType" }),
        );
    }

    const { data, error } = await logUserActivityForStreak(
      userId,
      app,
      actionType,
      metadata,
    );

    if (error) {
      return res
        .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
        .json(sendAPIResponse({ status: false, message: error }));
    }

    return res.status(apiStatusCodes.RESOURCE_CREATED).json(
      sendAPIResponse({
        status: true,
        message: "Activity logged successfully",
        data,
      }),
    );
  } catch (error) {
    logger.error("Streak POST API error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res
      .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        sendAPIResponse({ status: false, message: "Internal server error" }),
      );
  }
};

export default withApiHandler(handler);
