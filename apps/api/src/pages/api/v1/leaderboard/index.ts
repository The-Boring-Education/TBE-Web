import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { LEADERBOARD_TYPES, TBE_APP } from "@/lib/constants";
import {
  generateLeaderboard,
  getLeaderboardWithUsersFromDB,
  saveLeaderboardToDB,
} from "@/lib/database";
import type { LeaderboardType, TBEAppType } from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

const isLeaderboardEntries = (
  value: unknown,
): value is { userId: string; points: number }[] => {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every(
    (entry) =>
      typeof entry === "object" &&
      entry !== null &&
      "userId" in entry &&
      "points" in entry &&
      typeof (entry as { userId: unknown }).userId === "string" &&
      typeof (entry as { points: unknown }).points === "number",
  );
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "POST":
        return await handleGenerateLeaderboard(req, res);
      case "GET":
        return await handleGetLeaderboard(req, res);
      default:
        return res.status(apiStatusCodes.BAD_REQUEST).json(
          sendAPIResponse({
            status: false,
            message: `Method ${req.method} Not Allowed`,
          }),
        );
    }
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Something went wrong",
        error,
      }),
    );
  }
};

/**
 * POST /api/v1/leaderboard
 * Optional body: { app?: TBEAppType }
 *
 * Generates and saves leaderboards for all time-windows (DAILY/WEEKLY/MONTHLY).
 * When `app` is provided only that app's leaderboard is generated.
 * When omitted, the global (all-apps) leaderboard is generated.
 */
const handleGenerateLeaderboard = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const appFilter =
      req.body?.app && TBE_APP.includes(req.body.app as TBEAppType)
        ? (req.body.app as TBEAppType)
        : undefined;

    for (const type of LEADERBOARD_TYPES) {
      const { data: topUsers, error: generateError } =
        await generateLeaderboard(type, appFilter);
      if (generateError || !isLeaderboardEntries(topUsers)) {
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
          sendAPIResponse({
            status: false,
            message: generateError || "Generated leaderboard data is invalid",
          }),
        );
      }

      const { error: saveError } = await saveLeaderboardToDB(
        type,
        topUsers,
        appFilter,
      );
      if (saveError) {
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
          sendAPIResponse({
            status: false,
            message: saveError,
          }),
        );
      }
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Leaderboards generated and saved successfully",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Leaderboard generation failed",
        error,
      }),
    );
  }
};

/**
 * GET /api/v1/leaderboard?type=<DAILY|WEEKLY|MONTHLY>&app=<TBEAppType>
 *
 * Fetches the saved leaderboard for a given time window and optional app.
 */
const handleGetLeaderboard = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { type, app } = req.query;

  if (!type || typeof type !== "string") {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Missing or invalid leaderboard type",
      }),
    );
  }

  const appFilter =
    typeof app === "string" && TBE_APP.includes(app as TBEAppType)
      ? (app as TBEAppType)
      : undefined;

  try {
    const { data, error } = await getLeaderboardWithUsersFromDB(
      type as LeaderboardType,
      appFilter,
    );

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: error,
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Leaderboard fetched successfully",
        data,
      }),
    );
  } catch (error: any) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Error fetching leaderboard",
        error: error.message,
      }),
    );
  }
};

export default withApiHandler(handler);
