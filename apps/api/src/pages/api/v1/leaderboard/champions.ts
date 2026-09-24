import { isLeaderboardType, isValidPeriodKey } from "@tbe/utils/leaderboard";
import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { getPeriodChampions } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

/**
 * GET /api/v1/leaderboard/champions?type=WEEKLY[&periodKey=2026-W39]
 *
 * Frozen Champions of a closed Period — the previous Period by default.
 * `data` is null when that Period has not been closed yet.
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

  const { type, periodKey } = req.query;
  if (!isLeaderboardType(type)) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Missing or invalid leaderboard type",
      }),
    );
  }
  if (periodKey !== undefined && !isValidPeriodKey(type, periodKey)) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({ status: false, message: "Invalid periodKey" }),
    );
  }

  const data = await getPeriodChampions(type, periodKey as string | undefined);

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=600",
  );
  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      message: "Champions fetched successfully",
      data,
    }),
  );
};

export default withApiHandler(handler);
