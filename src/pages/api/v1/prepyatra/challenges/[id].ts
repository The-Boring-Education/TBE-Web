import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/middlewares';
import { cors } from '@/utils/cors';
import Challenge from '@/database/models/PrepYatra/Challenge';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!req.method || !['GET', 'PUT', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'Challenge ID is required' });
    }

    switch (req.method) {
      case 'GET':
        const challenge = await Challenge.findById(id);
        if (!challenge) {
          return res.status(404).json({ message: 'Challenge not found' });
        }
        return res.status(200).json({ 
          success: true, 
          message: 'Challenge retrieved successfully', 
          data: challenge 
        });

      case 'PUT':
        const { name, totalDays, category, isActive } = req.body;
        
        const updatedChallenge = await Challenge.findByIdAndUpdate(
          id,
          { name, totalDays, category, isActive },
          { new: true, runValidators: true }
        );

        if (!updatedChallenge) {
          return res.status(404).json({ message: 'Challenge not found' });
        }

        return res.status(200).json({ 
          success: true, 
          message: 'Challenge updated successfully', 
          data: updatedChallenge 
        });

      case 'DELETE':
        const deletedChallenge = await Challenge.findByIdAndUpdate(
          id,
          { isActive: false },
          { new: true }
        );
        
        if (!deletedChallenge) {
          return res.status(404).json({ message: 'Challenge not found' });
        }

        return res.status(200).json({ 
          success: true, 
          message: 'Challenge deactivated successfully' 
        });

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Challenge API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
