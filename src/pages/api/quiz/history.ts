import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getUserQuizHistory, getUserQuizStats } from '@/database/query/quiz';
import { connectDB } from '@/middlewares';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { limit, categoryId } = req.query;

  try {
    await connectDB();

    // Get quiz history
    const { data: history, error: historyError } = await getUserQuizHistory(
      session.user.id,
      limit ? parseInt(limit as string) : undefined,
      categoryId as string
    );

    if (historyError) {
      return res.status(400).json({ error: historyError });
    }

    // Get quiz statistics
    const { data: stats, error: statsError } = await getUserQuizStats(
      session.user.id
    );

    if (statsError) {
      return res.status(400).json({ error: statsError });
    }

    return res.status(200).json({
      success: true,
      data: {
        history,
        stats,
      },
    });
  } catch (error) {
    console.error('Quiz history API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default handler;
