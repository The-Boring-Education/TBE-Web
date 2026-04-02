import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  handleGamificationPoints,
  markAptitudeQuestionCompletedByUser,
} from "@/lib/database";
import type { MarkAptitudeQuestionCompletedRequestProps } from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PATCH") {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} Not Allowed`,
      }),
    );
  }

  const { userId, topicSlug, questionId, isCompleted } =
    req.body as MarkAptitudeQuestionCompletedRequestProps;

  if (
    !userId ||
    !topicSlug ||
    !questionId ||
    typeof isCompleted !== "boolean"
  ) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message:
          "userId, topicSlug, questionId, and isCompleted (boolean) are required",
      }),
    );
  }

  try {
    const { data, error } = await markAptitudeQuestionCompletedByUser(
      userId,
      topicSlug,
      questionId,
      isCompleted,
    );

    if (error) {
      const notFound =
        error === "Topic not found" || error === "Question not found for topic";
      return res.status(notFound ? apiStatusCodes.NOT_FOUND : 500).json(
        sendAPIResponse({
          status: false,
          message:
            typeof error === "string"
              ? error
              : "Failed to update aptitude progress",
        }),
      );
    }

    await handleGamificationPoints(
      isCompleted,
      userId,
      "COMPLETE_APTITUDE_QUESTION",
    );

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: "Aptitude question progress updated",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to update aptitude progress",
        error,
      }),
    );
  }
};

export default withApiHandler(handler);
