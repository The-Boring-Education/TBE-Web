import type { NextApiRequest, NextApiResponse } from "next";

import { addUserQuizAttemptToDB, getQuizByIdFromDB } from "@/lib/database";
import { updateUserAnalyticsInDB } from "@/lib/database/queries/enhancedQuiz";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withApiHandler } from "@/middleware/requestLogger";

interface QuizAnswer {
  questionIndex: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number; // seconds spent on this question
}

interface SubmitQuizRequest {
  userId: string;
  answers: QuizAnswer[];
  totalTimeSpent: number; // total time in seconds
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res
      .status(400)
      .json(sendAPIResponse({ status: false, message: "Quiz ID is required" }));
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json(sendAPIResponse({ status: false, message: "Method not allowed" }));
  }

  try {
    return await handleSubmitQuiz(id, req, res);
  } catch (error) {
    logger.error("Quiz submit API error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res
      .status(500)
      .json(
        sendAPIResponse({ status: false, message: "Internal server error" }),
      );
  }
}

async function handleSubmitQuiz(
  quizId: string,
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { userId, answers, totalTimeSpent }: SubmitQuizRequest = req.body;

  // Validation
  if (!userId) {
    return res
      .status(400)
      .json(sendAPIResponse({ status: false, message: "userId is required" }));
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json(
      sendAPIResponse({
        status: false,
        message: "answers array is required",
      }),
    );
  }

  if (typeof totalTimeSpent !== "number" || totalTimeSpent < 0) {
    return res.status(400).json(
      sendAPIResponse({
        status: false,
        message: "totalTimeSpent is required and must be a positive number",
      }),
    );
  }

  // Get quiz to validate answers
  const { data: quiz, error: quizError } = await getQuizByIdFromDB(
    quizId,
    true,
  );

  if (quizError || !quiz) {
    return res
      .status(404)
      .json(sendAPIResponse({ status: false, message: "Quiz not found" }));
  }

  // Calculate score and correct answers
  let correctAnswers = 0;
  const detailedResults = answers.map((answer) => {
    const question = quiz.questions[answer.questionIndex];
    if (!question) {
      return {
        questionIndex: answer.questionIndex,
        isCorrect: false,
        selectedAnswer: answer.selectedAnswer,
        timeSpent: answer.timeSpent,
      };
    }

    const isCorrect = question.correctAnswer === answer.selectedAnswer;
    if (isCorrect) correctAnswers++;

    return {
      questionIndex: answer.questionIndex,
      isCorrect,
      selectedAnswer: answer.selectedAnswer,
      timeSpent: answer.timeSpent,
    };
  });

  const totalQuestions = answers.length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);

  // Save attempt to database
  const attemptData = {
    userId,
    quizId,
    score,
    totalQuestions,
    correctAnswers,
    totalTimeSpent,
    answers: detailedResults,
    categoryName: quiz.categoryName,
    completedAt: new Date().toISOString(),
  };

  const { data: attempt, error: attemptError } =
    await addUserQuizAttemptToDB(attemptData);

  if (attemptError) {
    logger.error("Failed to save quiz attempt", {
      attemptError:
        attemptError instanceof Error
          ? attemptError.message
          : String(attemptError),
      attemptData: JSON.stringify(attemptData, null, 2),
    });
    return res.status(500).json(
      sendAPIResponse({
        status: false,
        message: "Failed to save quiz attempt",
      }),
    );
  }

  // Update analytics (including bestStreak) — fire and forget; don't block response
  updateUserAnalyticsInDB({
    userId,
    categoryName: quiz.categoryName,
    score,
    difficulty: "mixed",
    timeSpent: totalTimeSpent,
    answers: detailedResults.map((r) => r.isCorrect),
  }).catch((err) =>
    logger.error("Failed to update quiz analytics after submit", {
      error: err instanceof Error ? err.message : String(err),
    }),
  );

  // Return results
  return res.status(200).json(
    sendAPIResponse({
      status: true,
      data: {
        attemptId: attempt._id,
        score,
        correctAnswers,
        totalQuestions,
        percentage: score,
        totalTimeSpent,
        results: detailedResults,
        categoryName: quiz.categoryName,
      },
    }),
  );
}

export default withApiHandler(handler);
