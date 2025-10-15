import type { NextApiRequest, NextApiResponse } from 'next';

import { getUserAnalyticsFromDB } from '@/lib/database';
import {cors} from '@/lib/utils';
import { connectDB } from '@/middleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  const { categoryName } = req.query;

  // Validation
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    await connectDB();

    const { data: analytics, error } = await getUserAnalyticsFromDB(
      userId,
      categoryName as string
    );

    if (error) {
      return res.status(400).json({ error });
    }

    // Format the response for frontend consumption
    const formattedAnalytics = analytics?.map((analytic: any) => ({
      userId: analytic.userId,
      categoryName: analytic.categoryName,
      totalAttempts: analytic.totalAttempts,
      bestScore: analytic.bestScore,
      averageScore: Math.round(analytic.averageScore * 10) / 10,
      totalTimeSpent: analytic.totalTimeSpent,
      strengthAreas: analytic.strengthAreas,
      improvementAreas: analytic.improvementAreas,
      difficultyPerformance: {
        easy: {
          attempts: analytic.difficultyPerformance.easy.attempts,
          successRate: Math.round(analytic.difficultyPerformance.easy.successRate * 100),
        },
        medium: {
          attempts: analytic.difficultyPerformance.medium.attempts,
          successRate: Math.round(analytic.difficultyPerformance.medium.successRate * 100),
        },
        hard: {
          attempts: analytic.difficultyPerformance.hard.attempts,
          successRate: Math.round(analytic.difficultyPerformance.hard.successRate * 100),
        },
      },
      progressTimeline: analytic.progressTimeline.map((entry: any) => ({
        date: entry.date,
        score: entry.score,
        difficulty: entry.difficulty,
        timeSpent: entry.timeSpent,
      })),
      lastAttemptAt: analytic.lastAttemptAt,
    })) || [];

    res.status(200).json({
      success: true,
      data: formattedAnalytics,
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default handler;