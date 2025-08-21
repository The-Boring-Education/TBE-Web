import { NextApiRequest, NextApiResponse } from 'next';
import cors from '@/middlewares/cors';
import { connectDB } from '@/database';
import { completeQuizSessionInDB } from '@/database/query/enhancedQuiz';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.query;

  // Validation
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  try {
    await connectDB();

    const { data: session, error } = await completeQuizSessionInDB(sessionId);

    if (error || !session) {
      return res.status(400).json({ error: error || 'Failed to complete session' });
    }

    // Calculate detailed results
    const answeredQuestions = session.questions.filter(q => q.userAnswer !== undefined);
    const correctAnswers = answeredQuestions.filter(q => q.isCorrect).length;
    const totalTime = session.totalTime || 0;

    // Calculate badge earned
    let badgeEarned = 'bronze';
    if (session.score! >= 90) badgeEarned = 'platinum';
    else if (session.score! >= 80) badgeEarned = 'gold';
    else if (session.score! >= 70) badgeEarned = 'silver';

    // Calculate streak bonus (simplified)
    const consecutiveCorrect = calculateConsecutiveCorrect(session.questions);
    const streakBonus = consecutiveCorrect >= 3 ? consecutiveCorrect * 10 : 0;

    const response = {
      sessionId: session._id,
      score: session.score,
      percentage: session.percentage,
      correctAnswers,
      totalQuestions: answeredQuestions.length,
      totalTime,
      badgeEarned,
      streakBonus,
      pointsEarned: correctAnswers * 10 + streakBonus,
      performance: {
        easy: calculateDifficultyPerformance(session.questions, 'easy'),
        medium: calculateDifficultyPerformance(session.questions, 'medium'),
        hard: calculateDifficultyPerformance(session.questions, 'hard'),
      },
      detailedResults: session.questions.map((q, index) => ({
        questionIndex: index,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: q.userAnswer,
        isCorrect: q.isCorrect,
        timeSpent: q.timeSpent,
        explanation: q.explanation,
        detailedExplanation: q.detailedExplanation,
      })),
    };

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error completing quiz session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to calculate consecutive correct answers
function calculateConsecutiveCorrect(questions: any[]): number {
  let maxStreak = 0;
  let currentStreak = 0;

  for (const question of questions) {
    if (question.isCorrect) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak;
}

// Helper function to calculate performance by difficulty
function calculateDifficultyPerformance(questions: any[], difficulty: string) {
  const difficultyQuestions = questions.filter(q => 
    q.difficulty === difficulty && q.userAnswer !== undefined
  );
  
  if (difficultyQuestions.length === 0) {
    return { attempted: 0, correct: 0, percentage: 0 };
  }

  const correct = difficultyQuestions.filter(q => q.isCorrect).length;
  
  return {
    attempted: difficultyQuestions.length,
    correct,
    percentage: Math.round((correct / difficultyQuestions.length) * 100),
  };
}

export default handler;