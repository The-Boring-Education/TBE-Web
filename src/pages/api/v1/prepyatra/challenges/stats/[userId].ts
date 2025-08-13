import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/middlewares';
import { cors } from '@/utils/cors';
import Challenge from '@/database/models/PrepYatra/Challenge';
import ChallengeLog from '@/database/models/PrepYatra/ChallengeLog';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const challenges = await Challenge.find({ user: String(userId) });
    const challengeIds = challenges.map(c => c._id);

    const logs = await ChallengeLog.find({ challenge: { $in: challengeIds } });

    // Calculate statistics
    const totalChallenges = challenges.length;
    const activeChallenges = challenges.filter(c => c.isActive).length;
    const completedChallenges = challenges.filter(c => c.currentDay >= c.totalDays).length;
    const totalHours = logs.reduce((sum, log) => sum + (log.hoursSpent || 0), 0);
    const totalDaysLogged = logs.length;

    const stats = {
      userId: String(userId),
      totalChallenges,
      activeChallenges,
      completedChallenges,
      totalHours,
      totalDaysLogged,
      averageHoursPerDay: totalDaysLogged > 0 ? Math.round((totalHours / totalDaysLogged) * 100) / 100 : 0,
      completionRate: totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0
    };

    return res.status(200).json({ 
      success: true, 
      message: 'Stats retrieved successfully', 
      data: stats 
    });
  } catch (error) {
    console.error('Challenge Stats API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
