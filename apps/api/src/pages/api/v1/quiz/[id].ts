import type { NextApiRequest, NextApiResponse } from "next";

import {
  appendQuestionsToQuizInDB,
  getQuizByIdFromDB,
  updateAQuizInDB,
} from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withApiHandler } from "@/middleware/requestLogger";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res
      .status(400)
      .json(sendAPIResponse({ status: false, message: "Quiz ID is required" }));
  }

  try {
    switch (req.method) {
      case "GET":
        return handleGetQuiz(id, req, res);

      case "PUT":
        return handleUpdateQuiz(id, req, res);
      case "POST":
        return handleAppendQuestions(id, req, res);

      default:
        return res
          .status(405)
          .json(
            sendAPIResponse({ status: false, message: "Method not allowed" }),
          );
    }
  } catch (error) {
    logger.error("Quiz API error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res
      .status(500)
      .json(
        sendAPIResponse({ status: false, message: "Internal server error" }),
      );
  }
}

async function handleGetQuiz(
  id: string,
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { includeInactive, shuffle, admin } = req.query;
  const includeInactiveQuizzes =
    typeof includeInactive === "string" ? includeInactive === "true" : false;

  const adminParam = Array.isArray(admin) ? admin[0] : admin;
  const isAdminFull = adminParam === "true";

  // Check if shuffling should be disabled
  const shouldShuffle = shuffle !== "false" && shuffle !== "0"; // Default to true for backward compatibility

  const { data, error } = await getQuizByIdFromDB(id, includeInactiveQuizzes);

  if (error) {
    return res
      .status(404)
      .json(sendAPIResponse({ status: false, message: error || "Not found" }));
  }

  // Full document for admin / modify flows (all questions, includes difficulty)
  if (isAdminFull) {
    const allQuestions = data.questions || [];
    const adminQuestions = allQuestions.map((question: any) => ({
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      detailedExplanation: question.detailedExplanation,
      difficulty: question.difficulty,
    }));

    const adminData = {
      _id: data._id,
      categoryName: data.categoryName,
      categoryDescription: data.categoryDescription,
      categoryIcon: data.categoryIcon,
      isActive: data.isActive,
      questions: adminQuestions,
    };

    return res
      .status(200)
      .json(sendAPIResponse({ status: true, data: adminData }));
  }

  // Get all questions
  const allQuestions = data.questions || [];

  // Only shuffle if shuffle parameter is not explicitly set to false
  let selectedQuestions;
  if (shouldShuffle) {
    const shuffledQuestions = [...allQuestions].sort(() => Math.random() - 0.5);
    selectedQuestions = shuffledQuestions.slice(0, 10);
  } else {
    // Return questions in their original order (first 10)
    selectedQuestions = allQuestions.slice(0, 10);
  }

  // Remove difficulty from questions for cleaner UI
  const simplifiedQuestions = selectedQuestions.map((question: any) => ({
    question: question.question,
    options: question.options,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    detailedExplanation: question.detailedExplanation,
  }));

  const simplifiedData = {
    _id: data._id,
    categoryName: data.categoryName,
    categoryDescription: data.categoryDescription,
    categoryIcon: data.categoryIcon,
    questions: simplifiedQuestions,
  };

  return res
    .status(200)
    .json(sendAPIResponse({ status: true, data: simplifiedData }));
}

async function handleUpdateQuiz(
  id: string,
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const updatedData = req.body;

  // Remove fields that shouldn't be updated directly
  delete updatedData._id;
  delete updatedData.createdAt;
  delete updatedData.updatedAt;

  const { data, error } = await updateAQuizInDB({ id, updatedData });

  if (error) {
    return res
      .status(400)
      .json(
        sendAPIResponse({ status: false, message: error || "Bad request" }),
      );
  }

  return res.status(200).json(sendAPIResponse({ status: true, data }));
}

async function handleAppendQuestions(
  id: string,
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { questions } = req.body || {};
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json(
      sendAPIResponse({
        status: false,
        message: "questions must be a non-empty array",
      }),
    );
  }

  const { data, error } = await appendQuestionsToQuizInDB(id, questions);
  if (error) {
    return res
      .status(400)
      .json(
        sendAPIResponse({ status: false, message: error || "Bad request" }),
      );
  }
  return res.status(200).json(sendAPIResponse({ status: true, data }));
}

export default withApiHandler(handler);
