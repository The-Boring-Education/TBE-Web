import type { NextApiRequest, NextApiResponse } from "next";

import type { QuizSessionQuestion } from "@/lib/database";
import { completeQuizSessionInDB, QuizSession } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withUserAuth } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";
import { getAuthenticatedUserId } from "@/middleware/userAuth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json(sendAPIResponse({ status: false, message: "Method not allowed" }));
  }

  const { sessionId } = req.query;

  // Validation
  if (!sessionId || typeof sessionId !== "string") {
    return res
      .status(400)
      .json(
        sendAPIResponse({ status: false, message: "Session ID is required" }),
      );
  }

  try {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) return;

    const ownedSession = await QuizSession.findById(sessionId)
      .select("userId")
      .lean();
    if (!ownedSession) {
      return res
        .status(404)
        .json(sendAPIResponse({ status: false, message: "Session not found" }));
    }
    if (ownedSession.userId.toString() !== userId) {
      return res
        .status(403)
        .json(sendAPIResponse({ status: false, message: "Access denied" }));
    }

    const { data: session, error } = await completeQuizSessionInDB(sessionId);

    if (error || !session) {
      return res.status(400).json(
        sendAPIResponse({
          status: false,
          message: error || "Failed to complete session",
        }),
      );
    }

    // Calculate detailed results
    const answeredQuestions = session.questions.filter(
      (q: QuizSessionQuestion) => q.userAnswer !== undefined,
    );
    const correctAnswers = answeredQuestions.filter(
      (q: QuizSessionQuestion) => q.isCorrect,
    ).length;
    const totalTime = session.totalTime || 0;

    // Calculate badge earned
    let badgeEarned = "bronze";
    if (session.score! >= 90) badgeEarned = "platinum";
    else if (session.score! >= 80) badgeEarned = "gold";
    else if (session.score! >= 70) badgeEarned = "silver";

    // Calculate streak bonus (simplified)
    const consecutiveCorrect = calculateConsecutiveCorrect(session.questions);
    const streakBonus = consecutiveCorrect >= 3 ? consecutiveCorrect * 10 : 0;

    const response = {
      sessionId: session._id,
      score: session.score,
      percentage: session.percentage,
      correctAnswers,
      totalQuestions: answeredQuestions.length,
      totalTime,
      badgeEarned,
      streakBonus,
      pointsEarned: correctAnswers * 10 + streakBonus,
      performance: {
        easy: calculateDifficultyPerformance(session.questions, "easy"),
        medium: calculateDifficultyPerformance(session.questions, "medium"),
        hard: calculateDifficultyPerformance(session.questions, "hard"),
      },
      detailedResults: session.questions.map(
        (q: QuizSessionQuestion, index: number) => ({
          questionIndex: index,
          question: q.question,
          options: q.options,
          userAnswer: q.userAnswer,
          isCorrect: q.isCorrect,
          timeSpent: q.timeSpent,
          explanation: q.explanation,
          detailedExplanation: q.detailedExplanation,
        }),
      ),
    };

    return res
      .status(200)
      .json(sendAPIResponse({ status: true, data: response }));
  } catch (error) {
    logger.error("Error completing quiz session", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res
      .status(500)
      .json(
        sendAPIResponse({ status: false, message: "Internal server error" }),
      );
  }
}

// Helper function to calculate consecutive correct answers
function calculateConsecutiveCorrect(questions: any[]): number {
  let maxStreak = 0;
  let currentStreak = 0;

  for (const question of questions) {
    if (question.isCorrect) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak;
}

// Helper function to calculate performance by difficulty
function calculateDifficultyPerformance(
  questions: QuizSessionQuestion[],
  difficulty: string,
) {
  const difficultyQuestions = questions.filter(
    (q: QuizSessionQuestion) =>
      q.difficulty === difficulty && q.userAnswer !== undefined,
  );

  if (difficultyQuestions.length === 0) {
    return { attempted: 0, correct: 0, percentage: 0 };
  }

  const correct = difficultyQuestions.filter(
    (q: QuizSessionQuestion) => q.isCorrect,
  ).length;

  return {
    attempted: difficultyQuestions.length,
    correct,
    percentage: Math.round((correct / difficultyQuestions.length) * 100),
  };
}

export default withApiHandler(withUserAuth(handler));
