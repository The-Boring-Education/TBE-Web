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
    const { id: challengeId } = req.query;

    if (!challengeId) {
      return res.status(400).json({ message: 'Challenge ID is required' });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const logs = await ChallengeLog.find({ challenge: String(challengeId) })
      .sort({ day: 1 });

    // Calculate progress
    const totalHours = logs.reduce((sum, log) => sum + (log.hoursSpent || 0), 0);
    const completedDays = logs.length;
    const progressPercentage = (completedDays / challenge.totalDays) * 100;

    // Calculate streak
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    for (let i = 1; i <= challenge.totalDays; i++) {
      const log = logs.find(l => l.day === i);
      if (log) {
        tempStreak++;
        currentStreak = tempStreak;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    const progress = {
      challengeId: String(challengeId),
      totalDays: challenge.totalDays,
      completedDays,
      currentDay: challenge.currentDay,
      progressPercentage: Math.round(progressPercentage * 100) / 100,
      totalHours,
      currentStreak,
      maxStreak,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      isActive: challenge.isActive
    };

    return res.status(200).json({ 
      success: true, 
      message: 'Progress retrieved successfully', 
      data: progress 
    });
  } catch (error) {
    console.error('Challenge Progress API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
