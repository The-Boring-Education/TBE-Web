import type { NextApiRequest, NextApiResponse } from "next";

import { getActiveSessionsFromDB } from "@/lib/database";
import { logger } from "@/lib/utils/logger";
import { withVerifiedAdminAuth } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { data: sessions, error } = await getActiveSessionsFromDB();

    if (error) {
      return res.status(400).json({ error });
    }

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    logger.error("Error fetching active sessions", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ error: "Internal server error" });
  }
}

export default withApiHandler(withVerifiedAdminAuth(handler));
