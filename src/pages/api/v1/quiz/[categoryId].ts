import type { NextApiRequest, NextApiResponse } from 'next';

import {
  getQuizByCategoryIdFromDB,
  updateAQuizInDB,
} from '@/database/query/quiz';
import { connectDB } from '@/middlewares';
import { cors } from '@/utils/cors';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const { categoryId } = req.query;

  if (!categoryId || typeof categoryId !== 'string') {
    return res.status(400).json({ error: 'Category ID is required' });
  }

  try {
    await connectDB();

    switch (req.method) {
      case 'GET':
        return handleGetQuiz(categoryId, res);

      case 'PUT':
        return handleUpdateQuiz(categoryId, req, res);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Quiz category API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetQuiz(categoryId: string, res: NextApiResponse) {
  const { data, error } = await getQuizByCategoryIdFromDB(categoryId);

  if (error) {
    return res.status(404).json({ error });
  }

  return res.status(200).json({ success: true, data });
}

async function handleUpdateQuiz(
  categoryId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const updatedData = req.body;

  // Remove fields that shouldn't be updated directly
  delete updatedData.categoryId;
  delete updatedData._id;
  delete updatedData.createdAt;
  delete updatedData.updatedAt;

  const { data, error } = await updateAQuizInDB({ categoryId, updatedData });

  if (error) {
    return res.status(400).json({ error });
  }

  return res.status(200).json({ success: true, data });
}

export default handler;
