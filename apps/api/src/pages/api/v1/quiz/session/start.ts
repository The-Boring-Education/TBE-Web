import { Types } from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";

import { Quiz, QuizSession } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withApiHandler } from "@/middleware/requestLogger";
import { getAuthenticatedUserId, verifyOwnership } from "@/middleware/userAuth";

interface StartSessionBody {
  userId: string;
  quizId: string;
  difficulty?: "easy" | "medium" | "hard" | "mixed";
  questionCount?: number;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json(
      sendAPIResponse({
        status: false,
        message: "Method not allowed",
      }),
    );
  }

  const authenticatedUserId = getAuthenticatedUserId(req, res);
  if (!authenticatedUserId) return;

  const {
    userId,
    quizId,
    difficulty = "mixed",
    questionCount = 10,
  }: StartSessionBody = req.body;

  // Validation
  if (!userId || !quizId) {
    return res.status(400).json(
      sendAPIResponse({
        status: false,
        message: "Missing required fields: userId, quizId",
      }),
    );
  }

  if (!verifyOwnership(authenticatedUserId, userId, res)) return;

  if (difficulty && !["easy", "medium", "hard", "mixed"].includes(difficulty)) {
    return res.status(400).json(
      sendAPIResponse({
        status: false,
        message: "Invalid difficulty. Must be easy, medium, hard, or mixed",
      }),
    );
  }

  if (questionCount < 1 || questionCount > 50) {
    return res.status(400).json(
      sendAPIResponse({
        status: false,
        message: "Question count must be between 1 and 50",
      }),
    );
  }

  try {
    // Get the quiz
    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz || !quiz.isActive) {
      return res.status(404).json(
        sendAPIResponse({
          status: false,
          message: "Quiz not found or inactive",
        }),
      );
    }

    // Check if quiz has questions
    if (!quiz.questions || quiz.questions.length === 0) {
      return res.status(400).json(
        sendAPIResponse({
          status: false,
          message: "Quiz has no questions",
        }),
      );
    }

    // Question selection
    let selectedQuestions = quiz.questions;

    // Filter by difficulty if not mixed
    if (difficulty !== "mixed") {
      selectedQuestions = quiz.questions.filter(
        (q) => q.difficulty === difficulty,
      );
    }

    // Limit to requested question count
    if (selectedQuestions.length > questionCount) {
      selectedQuestions = selectedQuestions.slice(0, questionCount);
    }

    if (selectedQuestions.length === 0) {
      return res.status(400).json(
        sendAPIResponse({
          status: false,
          message: "No questions available for the selected difficulty",
        }),
      );
    }

    // Create session data
    const sessionData = {
      userId: new Types.ObjectId(userId),
      quizId: new Types.ObjectId(quizId),
      categoryName: quiz.categoryName,
      difficulty,
      questionCount: selectedQuestions.length,
      questions: selectedQuestions.map((q) => ({
        questionId: new Types.ObjectId(),
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty,
        explanation: q.explanation,
        detailedExplanation: q.detailedExplanation,
      })),
      status: "in_progress",
      startedAt: new Date(),
    };

    // Create and save session
    const session = new QuizSession(sessionData);
    await session.save();

    // Return session with first question
    const response = {
      sessionId: session._id,
      categoryName: session.categoryName,
      difficulty: session.difficulty,
      questionCount: session.questionCount,
      currentQuestionIndex: 0,
      currentQuestion: session.questions[0]
        ? {
            question: session.questions[0].question,
            options: session.questions[0].options,
            difficulty: session.questions[0].difficulty,
          }
        : null,
      progress: {
        answered: 0,
        total: session.questionCount,
        percentage: 0,
      },
    };

    return res.status(201).json(
      sendAPIResponse({
        status: true,
        data: response,
      }),
    );
  } catch (error) {
    logger.error("Error starting quiz session", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json(
      sendAPIResponse({
        status: false,
        message: "Internal server error",
        error,
      }),
    );
  }
}

export default withApiHandler(handler);
