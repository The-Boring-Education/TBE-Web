import type { NextApiRequest, NextApiResponse } from 'next';

import { getQuizByCategoryId } from '@/database/query/quiz';
import { connectDB } from '@/middlewares';
import { cors } from '@/utils/cors';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { categoryId } = req.query;

  if (!categoryId || typeof categoryId !== 'string') {
    return res.status(400).json({ error: 'Category ID is required' });
  }

  try {
    await connectDB();
    const { data, error } = await getQuizByCategoryId(categoryId);

    if (error) {
      return res.status(404).json({ error });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Quiz questions API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default handler;
