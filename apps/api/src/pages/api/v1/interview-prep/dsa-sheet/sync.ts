import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { syncDSAQuestionsProgress } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} Not Allowed`,
      }),
    );
  }

  const { userId, questions, sheetId } = req.body;

  if (!userId || !Array.isArray(questions)) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message:
          "Required: userId and questions (array of object with questionId, isCompleted, notes)",
      }),
    );
  }

  const { data, error } = await syncDSAQuestionsProgress(
    userId,
    questions,
    sheetId,
  );

  if (error) {
    return res
      .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        sendAPIResponse({ status: false, message: "Failed to sync", error }),
      );
  }

  return res
    .status(apiStatusCodes.OKAY)
    .json(sendAPIResponse({ status: true, data, message: "Progress synced" }));
};

export default withApiHandler(handler);
