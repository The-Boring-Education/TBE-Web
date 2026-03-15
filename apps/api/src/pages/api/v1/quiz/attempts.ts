import type { NextApiRequest, NextApiResponse } from "next";

import { getUserQuizHistoryFromDB } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withApiHandler } from "@/middleware/requestLogger";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json(sendAPIResponse({ status: false, message: "Method not allowed" }));
  }

  const { userId, limit, quizId } = req.query;

  // Basic validation
  if (!userId || typeof userId !== "string") {
    return res
      .status(400)
      .json(sendAPIResponse({ status: false, message: "User ID is required" }));
  }

  try {
    const { data: history, error } = await getUserQuizHistoryFromDB({
      userId,
      limit: limit ? parseInt(limit as string) : 20,
      quizId: quizId as string,
    });

    if (error) {
      return res.status(400).json(
        sendAPIResponse({
          status: false,
          message: "Error fetching quiz history",
          error,
        }),
      );
    }

    return res
      .status(200)
      .json(sendAPIResponse({ status: true, data: history }));
  } catch (error) {
    logger.error("Quiz attempts API error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res
      .status(500)
      .json(
        sendAPIResponse({ status: false, message: "Internal server error" }),
      );
  }
}

export default withApiHandler(handler);
