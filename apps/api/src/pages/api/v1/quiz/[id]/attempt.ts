import type { NextApiRequest, NextApiResponse } from "next";

import { getQuizByIdFromDB, saveQuizAttemptToDB } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withApiHandler } from "@/middleware/requestLogger";

interface SubmitQuizBody {
  userId: string;
  answers: number[];
  timeTaken: number;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json(sendAPIResponse({ status: false, message: "Method not allowed" }));
  }

  const { id } = req.query;
  const { userId, answers, timeTaken }: SubmitQuizBody = req.body;

  // Basic validation
  if (!id || typeof id !== "string") {
    return res
      .status(400)
      .json(sendAPIResponse({ status: false, message: "Quiz ID is required" }));
  }

  if (!userId || !answers || !Array.isArray(answers) || !timeTaken) {
    return res
      .status(400)
      .json(
        sendAPIResponse({
          status: false,
          message: "Missing required fields: userId, answers, timeTaken",
        }),
      );
  }

  try {
    // Get quiz questions to calculate score
    const { data: quiz, error: quizError } = await getQuizByIdFromDB(id, true);
    if (quizError || !quiz) {
      return res
        .status(404)
        .json(sendAPIResponse({ status: false, message: "Quiz not found" }));
    }

    // Simple score calculation
    let correctAnswers = 0;
    const attemptAnswers = answers.map((answer, index) => {
      const isCorrect = answer === quiz.questions[index]?.correctAnswer;
      if (isCorrect) correctAnswers++;

      return {
        questionIndex: index,
        selectedAnswer: answer,
        isCorrect,
        timeSpent: Math.round(timeTaken / answers.length),
      };
    });

    const score = Math.round((correctAnswers / answers.length) * 100);

    // Simple points calculation - 10 points per correct answer
    const pointsEarned = correctAnswers * 10;

    // Save attempt
    const attemptData = {
      userId: userId as any,
      quizId: quiz._id as any,
      categoryName: quiz.categoryName,
      answers: attemptAnswers,
      score,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      timeTaken,
      pointsEarned,
      completedAt: new Date(),
    };

    const { data: savedAttempt, error: saveError } =
      await saveQuizAttemptToDB(attemptData);

    if (saveError) {
      return res
        .status(500)
        .json(
          sendAPIResponse({
            status: false,
            message: "Failed to save quiz attempt",
          }),
        );
    }

    return res.status(200).json(
      sendAPIResponse({
        status: true,
        data: {
          score,
          correctAnswers,
          totalQuestions: quiz.questions.length,
          pointsEarned,
          timeTaken,
          attemptId: savedAttempt._id,
        },
      }),
    );
  } catch (error) {
    logger.error("Quiz attempt API error", {
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
