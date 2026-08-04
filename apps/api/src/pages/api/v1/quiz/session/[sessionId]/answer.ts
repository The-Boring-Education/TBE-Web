import type { NextApiRequest, NextApiResponse } from "next";

import { submitAnswerInDB } from "@/lib/database";
import { QuizSession } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withApiHandler } from "@/middleware/requestLogger";
import { getAuthenticatedUserId } from "@/middleware/userAuth";

interface SubmitAnswerBody {
  questionIndex: number;
  answer: number;
  timeSpent: number;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json(sendAPIResponse({ status: false, message: "Method not allowed" }));
  }

  const { sessionId } = req.query;
  const { questionIndex, answer, timeSpent }: SubmitAnswerBody = req.body;

  // Validation
  if (!sessionId || typeof sessionId !== "string") {
    return res
      .status(400)
      .json(
        sendAPIResponse({ status: false, message: "Session ID is required" }),
      );
  }

  if (
    questionIndex === undefined ||
    answer === undefined ||
    timeSpent === undefined
  ) {
    return res.status(400).json(
      sendAPIResponse({
        status: false,
        message: "Missing required fields: questionIndex, answer, timeSpent",
      }),
    );
  }

  const authenticatedUserId = getAuthenticatedUserId(req, res);
  if (!authenticatedUserId) return;

  if (typeof questionIndex !== "number" || questionIndex < 0) {
    return res
      .status(400)
      .json(
        sendAPIResponse({ status: false, message: "Invalid question index" }),
      );
  }

  if (typeof answer !== "number" || answer < 0) {
    return res
      .status(400)
      .json(sendAPIResponse({ status: false, message: "Invalid answer" }));
  }

  if (typeof timeSpent !== "number" || timeSpent < 0) {
    return res
      .status(400)
      .json(sendAPIResponse({ status: false, message: "Invalid time spent" }));
  }

  try {
    const sessionOwner = await QuizSession.findById(sessionId).lean();
    if (!sessionOwner) {
      return res
        .status(404)
        .json(sendAPIResponse({ status: false, message: "Session not found" }));
    }
    if (sessionOwner.userId.toString() !== authenticatedUserId) {
      return res
        .status(403)
        .json(sendAPIResponse({ status: false, message: "Forbidden" }));
    }

    // Submit the answer
    const { data: result, error } = await submitAnswerInDB({
      sessionId,
      questionIndex,
      answer,
      timeSpent,
    });

    if (error || !result) {
      return res.status(400).json(
        sendAPIResponse({
          status: false,
          message: error || "Failed to submit answer",
        }),
      );
    }

    // Get updated session to check if there are more questions
    const session = await QuizSession.findById(sessionId).lean();
    if (!session) {
      return res
        .status(404)
        .json(sendAPIResponse({ status: false, message: "Session not found" }));
    }

    const answeredQuestions = session.questions.filter(
      (q: any) => q.userAnswer !== undefined,
    ).length;

    const isCompleted = answeredQuestions >= session.questionCount;
    const nextQuestionIndex = answeredQuestions;

    let nextQuestion = null;
    const q = session.questions[nextQuestionIndex]; // ✅ narrow here
    if (!isCompleted && q) {
      nextQuestion = {
        index: nextQuestionIndex,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
      };
    }

    const response = {
      isCorrect: result.isCorrect,
      explanation: result.explanation,
      detailedExplanation: result.detailedExplanation,
      nextQuestion,
      isCompleted,
      progress: {
        answered: answeredQuestions,
        total: session.questionCount,
        percentage: Math.round(
          (answeredQuestions / session.questionCount) * 100,
        ),
      },
    };

    return res
      .status(200)
      .json(sendAPIResponse({ status: true, data: response }));
  } catch (error) {
    logger.error("Error submitting answer", {
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
