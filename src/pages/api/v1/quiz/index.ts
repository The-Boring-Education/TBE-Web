import type { NextApiRequest, NextApiResponse } from 'next';

import { addAQuizToDB, getQuizCategoriesFromDB } from '@/database/query/quiz';
import { connectDB } from '@/middlewares';
import { cors } from '@/utils/cors';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  try {
    await connectDB();

    switch (req.method) {
      case 'GET':
        return handleGetCategories(res);

      case 'POST':
        return handleCreateQuiz(req, res);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Quiz API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetCategories(res: NextApiResponse) {
  const { data, error } = await getQuizCategoriesFromDB();

  if (error) {
    return res.status(400).json({ error });
  }

  return res.status(200).json({ success: true, data });
}

async function handleCreateQuiz(req: NextApiRequest, res: NextApiResponse) {
  const {
    categoryId,
    categoryName,
    categoryDescription,
    categoryIcon,
    questions,
    isActive = true,
  } = req.body;

  // Basic validation
  if (
    !categoryId ||
    !categoryName ||
    !categoryDescription ||
    !categoryIcon ||
    !questions
  ) {
    return res.status(400).json({
      error:
        'Missing required fields: categoryId, categoryName, categoryDescription, categoryIcon, questions',
    });
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return res
      .status(400)
      .json({ error: 'Questions must be a non-empty array' });
  }

  const quizData = {
    categoryId,
    categoryName,
    categoryDescription,
    categoryIcon,
    questions,
    isActive,
  };

  const { data, error } = await addAQuizToDB(quizData);

  if (error) {
    return res.status(400).json({ error });
  }

  return res.status(201).json({ success: true, data });
}

export default handler;
