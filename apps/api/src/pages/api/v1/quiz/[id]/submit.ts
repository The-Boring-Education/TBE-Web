import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/middleware';
import { cors } from '@tbe/utils';
import { addUserQuizAttemptToDB, getQuizByIdFromDB } from '@tbe/database';

interface QuizAnswer {
  questionIndex: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number; // seconds spent on this question
}

interface SubmitQuizRequest {
  userId: string;
  answers: QuizAnswer[];
  totalTimeSpent: number; // total time in seconds
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Quiz ID is required' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    return handleSubmitQuiz(id, req, res);
  } catch (error) {
    console.error('Quiz submit API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleSubmitQuiz(
  quizId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId, answers, totalTimeSpent }: SubmitQuizRequest = req.body;

  // Validation
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'answers array is required' });
  }

  if (typeof totalTimeSpent !== 'number' || totalTimeSpent < 0) {
    return res.status(400).json({ error: 'totalTimeSpent is required and must be a positive number' });
  }

  // Get quiz to validate answers
  const { data: quiz, error: quizError } = await getQuizByIdFromDB(quizId, true);
  
  if (quizError || !quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  // Calculate score and correct answers
  let correctAnswers = 0;
  const detailedResults = answers.map((answer) => {
    const question = quiz.questions[answer.questionIndex];
    if (!question) {
      return {
        questionIndex: answer.questionIndex,
        isCorrect: false,
        selectedAnswer: answer.selectedAnswer,
        timeSpent: answer.timeSpent
      };
    }

    const isCorrect = question.correctAnswer === answer.selectedAnswer;
    if (isCorrect) correctAnswers++;

    return {
      questionIndex: answer.questionIndex,
      isCorrect,
      selectedAnswer: answer.selectedAnswer,
      timeSpent: answer.timeSpent
    };
  });

  const totalQuestions = answers.length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);

  // Save attempt to database
  const attemptData = {
    userId,
    quizId,
    score,
    totalQuestions,
    correctAnswers,
    totalTimeSpent,
    answers: detailedResults,
    categoryName: quiz.categoryName,
    completedAt: new Date().toISOString()
  };

  const { data: attempt, error: attemptError } = await addUserQuizAttemptToDB(attemptData);

  if (attemptError) {
    console.error('Failed to save quiz attempt:', attemptError);
    console.error('Attempt data that failed:', JSON.stringify(attemptData, null, 2));
    return res.status(500).json({ error: 'Failed to save quiz attempt' });
  }

  // Return results
  return res.status(200).json({
    success: true,
    data: {
      attemptId: attempt._id,
      score,
      correctAnswers,
      totalQuestions,
      percentage: score,
      totalTimeSpent,
      results: detailedResults,
      categoryName: quiz.categoryName
    }
  });
}

export default handler;