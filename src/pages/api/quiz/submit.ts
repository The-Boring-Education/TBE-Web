import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';

import type { QuizAttemptAnswer } from '@/database/models/Quiz/QuizAttempt';
import { updateUserPointsInDB } from '@/database/query/gamification';
import {
  getQuizByCategoryId,
  getUserQuizStreak,
  hasUserAttemptedQuizToday,
  saveQuizAttempt,
} from '@/database/query/quiz';
import { connectDB } from '@/middlewares';

import { authOptions } from '../auth/[...nextauth]';

interface SubmitQuizBody {
  categoryId: string;
  answers: (number | null)[];
  timeTaken: number;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { categoryId, answers, timeTaken }: SubmitQuizBody = req.body;

  if (!categoryId || !answers || !timeTaken) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await connectDB();

    // Get quiz questions to calculate score
    const { data: quiz, error: quizError } = await getQuizByCategoryId(
      categoryId
    );
    if (quizError || !quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Calculate score and prepare attempt answers
    let correctAnswers = 0;
    const attemptAnswers: QuizAttemptAnswer[] = answers.map((answer, index) => {
      const isCorrect = answer === quiz.questions[index]?.correctAnswer;
      if (isCorrect) correctAnswers++;

      return {
        questionIndex: index,
        selectedAnswer: answer,
        isCorrect,
        timeSpent: Math.round(timeTaken / answers.length), // Average time per question
      };
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    // Calculate points earned
    let pointsEarned = 0;
    const actions: string[] = [];

    // Base points for completing quiz
    actions.push('COMPLETE_QUIZ');
    pointsEarned += 30;

    // Bonus for perfect score
    if (score === 100) {
      actions.push('QUIZ_PERFECT_SCORE');
      pointsEarned += 50;
    }

    // Check for quiz streak
    const { data: hasAttemptedToday } = await hasUserAttemptedQuizToday(
      session.user.id
    );
    if (!hasAttemptedToday) {
      const { data: streakData } = await getUserQuizStreak(session.user.id);
      if (streakData && streakData.currentStreak > 0) {
        actions.push('QUIZ_STREAK');
        pointsEarned += 20;
      }
    }

    // Save quiz attempt
    const attemptData = {
      userId: session.user.id,
      quizId: quiz._id,
      categoryId: quiz.categoryId,
      categoryName: quiz.categoryName,
      answers: attemptAnswers,
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      timeTaken,
      pointsEarned,
    };

    const { data: savedAttempt, error: saveError } = await saveQuizAttempt(
      attemptData
    );

    if (saveError) {
      return res.status(500).json({ error: 'Failed to save quiz attempt' });
    }

    // Update user points for each action
    for (const action of actions) {
      await updateUserPointsInDB(session.user.id, action as any);
    }

    // Get updated streak info
    const { data: updatedStreak } = await getUserQuizStreak(session.user.id);

    return res.status(200).json({
      success: true,
      data: {
        attemptId: savedAttempt._id,
        score,
        correctAnswers,
        totalQuestions: quiz.questions.length,
        pointsEarned,
        streak: updatedStreak,
        actions,
      },
    });
  } catch (error) {
    console.error('Quiz submit API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default handler;
