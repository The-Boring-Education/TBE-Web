import { NextApiRequest, NextApiResponse } from 'next';
import cors from '@/middlewares/cors';
import { connectDB } from '@/database';
import { getLeaderboardFromDB } from '@/database/query/enhancedQuiz';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { categoryName, limit = '50' } = req.query;

  try {
    await connectDB();

    const { data: leaderboard, error } = await getLeaderboardFromDB(
      categoryName as string,
      parseInt(limit as string)
    );

    if (error) {
      return res.status(400).json({ error });
    }

    // Add rank numbers to the leaderboard
    const rankedLeaderboard = leaderboard?.map((entry: any, index: number) => ({
      ...entry,
      rank: index + 1,
    })) || [];

    res.status(200).json({
      success: true,
      data: rankedLeaderboard,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default handler;