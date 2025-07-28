import type { NextApiRequest, NextApiResponse } from 'next';
import { apiStatusCodes } from '@/constant';
import { connectDB } from '@/middlewares';
import { cors, sendAPIResponse } from '@/utils';

// Static quiz categories - in production this would come from database
const quizCategories = [
  {
    categoryId: 'javascript',
    categoryName: 'JavaScript Fundamentals',
    categoryDescription:
      'Test your core JavaScript knowledge including types, operators, and language quirks',
    categoryIcon: 'Code',
  },
  {
    categoryId: 'react',
    categoryName: 'React Development',
    categoryDescription:
      'Explore React hooks, components, and modern React patterns',
    categoryIcon: 'Zap',
  },
  {
    categoryId: 'algorithms',
    categoryName: 'Algorithms & Data Structures',
    categoryDescription:
      'Challenge yourself with algorithm complexity and data structure concepts',
    categoryIcon: 'Brain',
  },
  {
    categoryId: 'webdev',
    categoryName: 'Web Development',
    categoryDescription:
      'Cover HTTP, APIs, and general web development concepts',
    categoryIcon: 'Globe',
  },
];

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);
  await connectDB();

  if (req.method !== 'GET') {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} Not Allowed`,
      })
    );
  }

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: quizCategories,
    })
  );
};

export default handler;
