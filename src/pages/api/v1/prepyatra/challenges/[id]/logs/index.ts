import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/middlewares';
import { cors } from '@/utils/cors';
import ChallengeLog from '@/database/models/PrepYatra/ChallengeLog';
import Challenge from '@/database/models/PrepYatra/Challenge';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!req.method || !['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { id: challengeId } = req.query;

    if (!challengeId) {
      return res.status(400).json({ message: 'Challenge ID is required' });
    }

    switch (req.method) {
      case 'GET':
        const logs = await ChallengeLog.find({ challenge: String(challengeId) })
          .sort({ day: 1 });
        return res.status(200).json({ 
          success: true, 
          message: 'Logs retrieved successfully', 
          data: logs 
        });

      case 'POST':
        const { day, progressText, hoursSpent, nextGoals } = req.body;
        
        if (!day || !progressText || hoursSpent === undefined) {
          return res.status(400).json({ 
            message: 'Day, progress text, and hours are required' 
          });
        }

        // Check if log already exists for this day
        const existingLog = await ChallengeLog.findOne({ 
          challenge: String(challengeId), 
          day: Number(day) 
        });

        if (existingLog) {
          return res.status(409).json({ 
            message: 'Log already exists for this day' 
          });
        }

        const log = new ChallengeLog({
          challenge: String(challengeId),
          day: Number(day),
          progressText,
          hoursSpent: Number(hoursSpent),
          nextGoals: nextGoals || []
        });

        await log.save();

        // Update challenge current day
        await Challenge.findByIdAndUpdate(challengeId, {
          currentDay: Math.max(Number(day), req.body.currentDay || 0)
        });

        return res.status(201).json({ 
          success: true, 
          message: 'Log created successfully', 
          data: log 
        });

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Challenge Logs API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
