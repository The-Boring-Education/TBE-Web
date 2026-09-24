import { LEADERBOARD_LIMITS } from "@tbe/constants";
import { isLeaderboardType } from "@tbe/utils/leaderboard";
import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  getChampionHistory,
  getLeaderboardBoard,
  resolvePeriodKey,
} from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { withVerifiedAdminAuth } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

/**
 * GET /api/v1/admin/leaderboard?type=WEEKLY&periodKey=&limit=50
 *
 * Full board for admins (hidden/excluded learners included and flagged)
 * plus recent Champion history for the type.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} Not Allowed`,
      }),
    );
  }

  const { type, periodKey, limit } = req.query;
  if (!isLeaderboardType(type)) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Missing or invalid leaderboard type",
      }),
    );
  }
  const key = resolvePeriodKey(type, periodKey, new Date());
  if (!key) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({ status: false, message: "Invalid periodKey" }),
    );
  }

  const [board, champions] = await Promise.all([
    getLeaderboardBoard({
      type,
      periodKey: key,
      limit: Number(limit) || LEADERBOARD_LIMITS.PAGE,
      audience: "admin",
    }),
    getChampionHistory(type),
  ]);

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      message: "Admin leaderboard fetched",
      data: { board, champions },
    }),
  );
};

export default withApiHandler(withVerifiedAdminAuth(handler));
