import type { NextApiRequest, NextApiResponse } from "next";

import { getQuizAdminAnalyticsFromDB } from "@/lib/database";
import { logger } from "@/lib/utils/logger";
import { withApiHandler } from "@/middleware/requestLogger";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { data: analytics, error } = await getQuizAdminAnalyticsFromDB();

    if (error) {
      return res.status(400).json({ error });
    }

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error("Error fetching admin analytics", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ error: "Internal server error" });
  }
}

export default withApiHandler(handler);
