import type { NextApiRequest, NextApiResponse } from "next";

import { getLeaderboardFromDB } from "@/lib/database/queries/userQuizAttempt";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withApiHandler } from "@/middleware/requestLogger";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json(sendAPIResponse({ status: false, message: "Method not allowed" }));
  }

  try {
    return handleGetLeaderboard(req, res);
  } catch (error) {
    logger.error("Leaderboard API error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res
      .status(500)
      .json(
        sendAPIResponse({ status: false, message: "Internal server error" }),
      );
  }
}

async function handleGetLeaderboard(req: NextApiRequest, res: NextApiResponse) {
  const { limit = "50", category } = req.query;
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
  const categoryFilter = typeof category === "string" ? category : undefined;

  const { data: leaderboard, error } = await getLeaderboardFromDB(limitNum);

  if (error) {
    return res
      .status(500)
      .json(
        sendAPIResponse({
          status: false,
          message: "Error fetching leaderboard",
          error,
        }),
      );
  }

  return res
    .status(200)
    .json(sendAPIResponse({ status: true, data: leaderboard }));
}

export default withApiHandler(handler);
