import type { NextApiRequest, NextApiResponse } from "next";

import { submitAnswerInDB } from "@/lib/database";
import { QuizSession } from "@/lib/database";
import { cors } from "@/lib/utils";
import { connectDB } from "@/middleware/api";

interface SubmitAnswerBody {
  questionIndex: number;
  answer: number;
  timeSpent: number;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sessionId } = req.query;
  const { questionIndex, answer, timeSpent }: SubmitAnswerBody = req.body;

  // Validation
  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({ error: "Session ID is required" });
  }

  if (
    questionIndex === undefined ||
    answer === undefined ||
    timeSpent === undefined
  ) {
    return res.status(400).json({
      error: "Missing required fields: questionIndex, answer, timeSpent",
    });
  }

  if (typeof questionIndex !== "number" || questionIndex < 0) {
    return res.status(400).json({ error: "Invalid question index" });
  }

  if (typeof answer !== "number" || answer < 0) {
    return res.status(400).json({ error: "Invalid answer" });
  }

  if (typeof timeSpent !== "number" || timeSpent < 0) {
    return res.status(400).json({ error: "Invalid time spent" });
  }

  try {
    await connectDB();

    // Submit the answer
    const { data: result, error } = await submitAnswerInDB({
      sessionId,
      questionIndex,
      answer,
      timeSpent,
    });

    if (error || !result) {
      return res
        .status(400)
        .json({ error: error || "Failed to submit answer" });
    }

    // Get updated session to check if there are more questions
    const session = await QuizSession.findById(sessionId).lean();
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
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

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export default handler;
