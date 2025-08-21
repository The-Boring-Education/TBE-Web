import { NextApiRequest, NextApiResponse } from 'next';
import cors from '@/middlewares/cors';
import { connectDB } from '@/database';
import { createQuizSessionInDB } from '@/database/query/enhancedQuiz';

interface StartSessionBody {
  userId: string;
  quizId: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionCount?: number;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, quizId, difficulty, questionCount = 10 }: StartSessionBody = req.body;

  // Validation
  if (!userId || !quizId || !difficulty) {
    return res.status(400).json({ 
      error: 'Missing required fields: userId, quizId, difficulty' 
    });
  }

  if (!['easy', 'medium', 'hard', 'mixed'].includes(difficulty)) {
    return res.status(400).json({ 
      error: 'Invalid difficulty. Must be easy, medium, hard, or mixed' 
    });
  }

  if (questionCount < 1 || questionCount > 50) {
    return res.status(400).json({ 
      error: 'Question count must be between 1 and 50' 
    });
  }

  try {
    await connectDB();

    const { data: session, error } = await createQuizSessionInDB({
      userId,
      quizId,
      difficulty,
      questionCount,
    });

    if (error || !session) {
      return res.status(400).json({ error: error || 'Failed to create session' });
    }

    // Return session with first question
    const response = {
      sessionId: session._id,
      categoryName: session.categoryName,
      difficulty: session.difficulty,
      questionCount: session.questionCount,
      currentQuestionIndex: 0,
      currentQuestion: session.questions[0] ? {
        question: session.questions[0].question,
        options: session.questions[0].options,
        difficulty: session.questions[0].difficulty,
      } : null,
      progress: {
        answered: 0,
        total: session.questionCount,
        percentage: 0,
      },
    };

    res.status(201).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error starting quiz session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default handler;