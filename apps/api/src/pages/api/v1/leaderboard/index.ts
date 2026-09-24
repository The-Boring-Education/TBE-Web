import { LEADERBOARD_LIMITS } from "@tbe/constants";
import { isLeaderboardType } from "@tbe/utils/leaderboard";
import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { getLeaderboardBoard, resolvePeriodKey } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { verifyAuthenticatedUser } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

/**
 * GET /api/v1/leaderboard?type=DAILY|WEEKLY|MONTHLY&limit=10&periodKey=
 *
 * Member leaderboard for a Period. With a valid access token the response also
 * carries the viewer's own standing (and is then private, not CDN-cached).
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

  const { type, limit, periodKey } = req.query;
  if (!isLeaderboardType(type)) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Missing or invalid leaderboard type",
      }),
    );
  }

  const now = new Date();
  const key = resolvePeriodKey(type, periodKey, now);
  if (!key) {
    return res
      .status(apiStatusCodes.BAD_REQUEST)
      .json(sendAPIResponse({ status: false, message: "Invalid periodKey" }));
  }

  const viewerId = verifyAuthenticatedUser(req)?.sub;
  const board = await getLeaderboardBoard({
    type,
    periodKey: key,
    limit: Number(limit) || LEADERBOARD_LIMITS.DASHBOARD,
    viewerId,
    audience: "member",
    now,
  });

  res.setHeader(
    "Cache-Control",
    viewerId
      ? "private, no-store"
      : "public, s-maxage=30, stale-while-revalidate=60",
  );
  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      message: "Leaderboard fetched successfully",
      data: board,
    }),
  );
};

export default withApiHandler(handler);
