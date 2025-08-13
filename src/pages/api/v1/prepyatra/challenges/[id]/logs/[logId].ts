import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/middlewares';
import { cors } from '@/utils/cors';
import ChallengeLog from '@/database/models/PrepYatra/ChallengeLog';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!req.method || !['PUT', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { logId } = req.query;

    if (!logId) {
      return res.status(400).json({ message: 'Log ID is required' });
    }

    switch (req.method) {
      case 'PUT':
        const { progressText, hoursSpent, nextGoals } = req.body;
        
        const updatedLog = await ChallengeLog.findByIdAndUpdate(
          logId,
          { progressText, hoursSpent, nextGoals },
          { new: true, runValidators: true }
        );

        if (!updatedLog) {
          return res.status(404).json({ message: 'Log not found' });
        }

        return res.status(200).json({ 
          success: true, 
          message: 'Log updated successfully', 
          data: updatedLog 
        });

      case 'DELETE':
        const deletedLog = await ChallengeLog.findByIdAndDelete(logId);
        
        if (!deletedLog) {
          return res.status(404).json({ message: 'Log not found' });
        }

        return res.status(200).json({ 
          success: true, 
          message: 'Log deleted successfully' 
        });

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Challenge Log API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
