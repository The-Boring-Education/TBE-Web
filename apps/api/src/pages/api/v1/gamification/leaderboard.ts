import type { NextApiRequest, NextApiResponse } from "next";

import { getLeaderboardFromDB } from "@/lib/database";
import { logger } from "@/lib/utils/logger";
import { withApiHandler } from "@/middleware/requestLogger";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { limit } = req.query;

  try {
    const { data, error } = await getLeaderboardFromDB(
      limit ? parseInt(limit as string) : 10,
    );

    if (error) {
      return res.status(400).json({ error });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error("Leaderboard API error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default withApiHandler(handler);
