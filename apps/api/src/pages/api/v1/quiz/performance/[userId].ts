import type { NextApiRequest, NextApiResponse } from "next";

import { getUserQuizPerformanceFromDB } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withApiHandler } from "@/middleware/requestLogger";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== "string") {
    return res
      .status(400)
      .json(sendAPIResponse({ status: false, message: "User ID is required" }));
  }

  if (req.method !== "GET") {
    return res
      .status(405)
      .json(sendAPIResponse({ status: false, message: "Method not allowed" }));
  }

  try {
    return handleGetUserPerformance(userId, req, res);
  } catch (error) {
    logger.error("Performance API error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res
      .status(500)
      .json(
        sendAPIResponse({ status: false, message: "Internal server error" }),
      );
  }
}

async function handleGetUserPerformance(
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { data: performance, error } =
    await getUserQuizPerformanceFromDB(userId);

  if (error) {
    return res
      .status(500)
      .json(
        sendAPIResponse({ status: false, message: "Error occurred", error }),
      );
  }

  return res.status(200).json(
    sendAPIResponse({
      status: true,
      data: performance,
    }),
  );
}

export default withApiHandler(handler);
