import type { NextApiRequest, NextApiResponse } from 'next';

import { getLeaderboardFromDB } from '@/database/query/gamification';
import { connectDB } from '@/middlewares';
import { applyMultiOriginCorsHeaders } from '@/utils';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply CORS headers
  const isPreflight = applyMultiOriginCorsHeaders(req, res);
  if (isPreflight) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { limit } = req.query;

  try {
    await connectDB();

    const { data, error } = await getLeaderboardFromDB(
      limit ? parseInt(limit as string) : 10
    );

    if (error) {
      return res.status(400).json({ error });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default handler;
