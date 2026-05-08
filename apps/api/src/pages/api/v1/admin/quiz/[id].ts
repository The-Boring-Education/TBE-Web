import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { getQuizByIdFromDB } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { adminMiddleware } from "@/middleware/api";
import { withApiHandler } from "@/middleware/requestLogger";

/**
 * Full quiz document for tbe-admin (all questions, no cap).
 * Public GET /api/v1/quiz/[id] limits to 10 questions for play mode.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const adminCheck = await adminMiddleware(req, res);
  if (!adminCheck) return;

  if (req.method !== "GET") {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} not allowed`,
      }),
    );
  }

  const { id, includeInactive } = req.query;
  const quizId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";

  if (!quizId) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Quiz ID is required",
      }),
    );
  }

  const includeInactiveParam = Array.isArray(includeInactive)
    ? includeInactive[0]
    : includeInactive;
  const includeInactiveQuizzes =
    includeInactiveParam === undefined || includeInactiveParam === "true";

  try {
    const { data, error } = await getQuizByIdFromDB(
      quizId,
      includeInactiveQuizzes,
    );

    if (error) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: error || "Not found",
        }),
      );
    }

    const fullQuestions = data.questions || [];
    const adminQuestions = fullQuestions.map((question: any) => ({
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      detailedExplanation: question.detailedExplanation,
      difficulty: question.difficulty,
    }));

    const payload = {
      _id: data._id,
      categoryName: data.categoryName,
      categoryDescription: data.categoryDescription,
      categoryIcon: data.categoryIcon,
      isActive: data.isActive,
      questions: adminQuestions,
    };

    return res
      .status(apiStatusCodes.OKAY)
      .json(sendAPIResponse({ status: true, data: payload }));
  } catch (error) {
    logger.error("admin quiz GET failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal server error",
      }),
    );
  }
};

export default withApiHandler(handler);
