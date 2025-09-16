import type { NextApiRequest, NextApiResponse } from 'next';

  import { getUserQuizHistoryFromDB } from '@tbe/database';
import { connectDB } from '@/middleware';
import { cors } from '@tbe/utils';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, limit, quizId } = req.query;

  // Basic validation
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    await connectDB();

    const { data: history, error } = await getUserQuizHistoryFromDB({
      userId,
      limit: limit ? parseInt(limit as string) : 20,
      quizId: quizId as string,
    });

    if (error) {
      return res.status(400).json({ error });
    }

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Quiz attempts API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default handler;
