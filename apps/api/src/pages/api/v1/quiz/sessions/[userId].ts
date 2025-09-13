import { NextApiRequest, NextApiResponse } from 'next';
import cors from '@/middlewares/cors';
import { connectDB } from '@/middlewares';
import { getUserQuizSessionsFromDB } from '@/database/query/enhancedQuiz';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  const { status } = req.query;

  // Validation
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  if (status && !['in_progress', 'completed', 'abandoned'].includes(status as string)) {
    return res.status(400).json({ 
      error: 'Invalid status. Must be in_progress, completed, or abandoned' 
    });
  }

  try {
    await connectDB();

    const { data: sessions, error } = await getUserQuizSessionsFromDB(
      userId,
      status as 'in_progress' | 'completed' | 'abandoned'
    );

    if (error) {
      return res.status(400).json({ error });
    }

    // Format sessions for frontend consumption
    const formattedSessions = sessions?.map((session: any) => {
      const answeredQuestions = session.questions.filter(
        (q: any) => q.userAnswer !== undefined
      ).length;

      return {
        sessionId: session._id,
        quizId: session.quizId,
        categoryName: session.categoryName,
        difficulty: session.difficulty,
        status: session.status,
        progress: {
          answered: answeredQuestions,
          total: session.questionCount,
          percentage: Math.round((answeredQuestions / session.questionCount) * 100),
        },
        score: session.score,
        percentage: session.percentage,
        totalTime: session.totalTime,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        canResume: session.status === 'in_progress' && answeredQuestions < session.questionCount,
      };
    }) || [];

    res.status(200).json({
      success: true,
      data: formattedSessions,
    });
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default handler;