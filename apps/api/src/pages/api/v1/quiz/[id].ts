import type { NextApiRequest, NextApiResponse } from 'next';

import {
  appendQuestionsToQuizInDB,
  getQuizByIdFromDB,
  updateAQuizInDB,
} from '@/lib/database';
import { cors } from '@/lib/utils';
import { connectDB } from '@/middleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Quiz ID is required' });
  }

  try {
    await connectDB();

    switch (req.method) {
      case 'GET':
        return handleGetQuiz(id, req, res);

      case 'PUT':
        return handleUpdateQuiz(id, req, res);
      case 'POST':
        return handleAppendQuestions(id, req, res);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Quiz API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetQuiz(id: string, req: NextApiRequest, res: NextApiResponse) {
  const { includeInactive, shuffle } = req.query;
  const includeInactiveQuizzes = typeof includeInactive === 'string' ? includeInactive === 'true' : false;
  
  // Check if shuffling should be disabled
  const shouldShuffle = shuffle !== 'false' && shuffle !== '0'; // Default to true for backward compatibility
  
  const { data, error } = await getQuizByIdFromDB(id, includeInactiveQuizzes);

  if (error) {
    return res.status(404).json({ error });
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
    detailedExplanation: question.detailedExplanation
  }));

  const simplifiedData = {
    _id: data._id,
    categoryName: data.categoryName,
    categoryDescription: data.categoryDescription,
    categoryIcon: data.categoryIcon,
    questions: simplifiedQuestions
  };

  return res.status(200).json({ success: true, data: simplifiedData });
}

async function handleUpdateQuiz(
  id: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const updatedData = req.body;

  // Remove fields that shouldn't be updated directly
  delete updatedData._id;
  delete updatedData.createdAt;
  delete updatedData.updatedAt;

  const { data, error } = await updateAQuizInDB({ id, updatedData });

  if (error) {
    return res.status(400).json({ error });
  }

  return res.status(200).json({ success: true, data });
}

async function handleAppendQuestions(
  id: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { questions } = req.body || {};
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'questions must be a non-empty array' });
  }

  const { data, error } = await appendQuestionsToQuizInDB(id, questions);
  if (error) {
    return res.status(400).json({ error });
  }
  return res.status(200).json({ success: true, data });
}

export default handler;
