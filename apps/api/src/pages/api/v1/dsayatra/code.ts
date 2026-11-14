import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { getUserQuestionCode, saveUserQuestionCode } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const { userId, questionId, language } = req.query;

    if (!userId || !questionId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Required parameters: userId, questionId",
        }),
      );
    }

    const { data, error } = await getUserQuestionCode(
      String(userId),
      String(questionId),
      language ? String(language) : undefined,
    );

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed to retrieve saved code",
          error,
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: "Code retrieved successfully",
      }),
    );
  }

  if (req.method === "POST") {
    const { userId, questionId, language, code } = req.body;

    if (!userId || !questionId || !language || code === undefined) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Required: userId, questionId, language, code",
        }),
      );
    }

    const validLanguages = ["javascript", "python", "java", "cpp"];
    if (!validLanguages.includes(language)) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Invalid language. Supported: ${validLanguages.join(", ")}`,
        }),
      );
    }

    const { data, error } = await saveUserQuestionCode(
      String(userId),
      String(questionId),
      String(language),
      String(code),
    );

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed to save code",
          error,
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: "Code saved successfully",
      }),
    );
  }

  return res.status(apiStatusCodes.BAD_REQUEST).json(
    sendAPIResponse({
      status: false,
      message: `Method ${req.method} Not Allowed`,
    }),
  );
};

export default withApiHandler(handler);

