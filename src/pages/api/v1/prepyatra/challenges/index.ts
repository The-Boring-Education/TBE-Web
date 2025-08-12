import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/middlewares';
import Challenge from '@/database/models/PrepYatra/Challenge';
import { cors } from '@/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!req.method || !['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await cors(req, res);

    await connectDB();

    switch (req.method) {
      case 'GET':
        const { userId: queryUserId } = req.query;
        if (!queryUserId) {
          return res.status(400).json({ message: 'User ID is required' });
        }

        const challenges = await Challenge.find({ user: String(queryUserId) }).sort({ createdAt: -1 });
        return res.status(200).json({ 
          success: true, 
          message: 'Challenges retrieved successfully', 
          data: challenges 
        });

      case 'POST':
        const { name, totalDays, category, user, userId } = req.body;
        
        // Accept both 'user' and 'userId' for flexibility
        const userField = user || userId;
        
        if (!name || !totalDays || !userField) {
          return res.status(400).json({ 
            message: 'Name, total days, and user/userId are required' 
          });
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + totalDays);

        const challenge = new Challenge({
          user: userField,
          name,
          totalDays,
          startDate,
          endDate,
          category,
          currentDay: 0,
          isActive: true
        });

        await challenge.save();
        return res.status(201).json({ 
          success: true, 
          message: 'Challenge created successfully', 
          data: challenge 
        });

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Challenges API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}