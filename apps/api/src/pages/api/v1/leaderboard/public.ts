import { LEADERBOARD_LIMITS } from "@tbe/constants";
import { isLeaderboardType } from "@tbe/utils/leaderboard";
import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { getLeaderboardBoard } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

/**
 * GET /api/v1/leaderboard/public?type=WEEKLY&limit=5
 *
 * Logged-out social proof: names masked to "First L.", no user ids or emails,
 * hidden/excluded learners removed. Safe to cache at the CDN.
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

  const type = req.query.type ?? "WEEKLY";
  if (!isLeaderboardType(type)) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Missing or invalid leaderboard type",
      }),
    );
  }

  const limit = Math.min(
    Number(req.query.limit) || LEADERBOARD_LIMITS.PUBLIC,
    LEADERBOARD_LIMITS.DASHBOARD,
  );
  const board = await getLeaderboardBoard({ type, limit, audience: "public" });

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300",
  );
  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      message: "Public leaderboard fetched successfully",
      data: board,
    }),
  );
};

export default withApiHandler(handler);
