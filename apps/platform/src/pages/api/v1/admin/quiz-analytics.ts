import type { NextApiRequest, NextApiResponse } from 'next';

import { getQuizAdminAnalyticsFromDB } from '@/database/query/enhancedQuiz';
import { connectDB } from '@/middlewares';
import { cors } from '@/utils/cors';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { data: analytics, error } = await getQuizAdminAnalyticsFromDB();

    if (error) {
      return res.status(400).json({ error });
    }

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default handler; 