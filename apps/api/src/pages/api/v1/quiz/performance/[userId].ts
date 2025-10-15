import type { NextApiRequest, NextApiResponse } from 'next';

import { getUserQuizPerformanceFromDB } from '@/lib/database';
import { cors } from '@/lib/utils';
import { connectDB } from '@/middleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const { userId } = req.query; 

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    return handleGetUserPerformance(userId, req, res);
  } catch (error) {
    console.error('Performance API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetUserPerformance(
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { data: performance, error } = await getUserQuizPerformanceFromDB(userId);

  if (error) {
    return res.status(500).json({ error });
  }

  return res.status(200).json({
    success: true,
    data: performance
  });
}

export default handler;