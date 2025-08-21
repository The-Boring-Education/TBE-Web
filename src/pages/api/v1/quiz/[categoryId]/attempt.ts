import type { NextApiRequest, NextApiResponse } from 'next';

import {
  getQuizByCategoryIdFromDB,
  saveQuizAttemptToDB,
} from '@/database/query/quiz';
import { connectDB } from '@/middlewares';
import { cors } from '@/utils/cors';

interface SubmitQuizBody {
  userId: string;
  answers: number[];
  timeTaken: number;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { categoryId } = req.query;
  const { userId, answers, timeTaken }: SubmitQuizBody = req.body;

  // Basic validation
  if (!categoryId || typeof categoryId !== 'string') {
    return res.status(400).json({ error: 'Category ID is required' });
  }

  if (!userId || !answers || !Array.isArray(answers) || !timeTaken) {
    return res
      .status(400)
      .json({ error: 'Missing required fields: userId, answers, timeTaken' });
  }

  try {
    await connectDB();

    // Get quiz questions to calculate score
    const { data: quiz, error: quizError } = await getQuizByCategoryIdFromDB(
      categoryId,
      true
    );
    if (quizError || !quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Simple score calculation
    let correctAnswers = 0;
    const attemptAnswers = answers.map((answer, index) => {
      const isCorrect = answer === quiz.questions[index]?.correctAnswer;
      if (isCorrect) correctAnswers++;

      return {
        questionIndex: index,
        selectedAnswer: answer,
        isCorrect,
        timeSpent: Math.round(timeTaken / answers.length),
      };
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    // Simple points calculation - 10 points per correct answer
    const pointsEarned = correctAnswers * 10;

    // Save attempt
    const attemptData = {
      userId: userId as any,
      quizId: quiz._id as any,
      categoryId,
      categoryName: quiz.categoryName,
      answers: attemptAnswers,
      score,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      timeTaken,
      pointsEarned,
      completedAt: new Date(),
    };

    const { data: savedAttempt, error: saveError } = await saveQuizAttemptToDB(
      attemptData
    );

    if (saveError) {
      return res.status(500).json({ error: 'Failed to save quiz attempt' });
    }

    return res.status(200).json({
      success: true,
      data: {
        score,
        correctAnswers,
        totalQuestions: quiz.questions.length,
        pointsEarned,
        timeTaken,
        attemptId: savedAttempt._id,
      },
    });
  } catch (error) {
    console.error('Quiz attempt API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default handler;
