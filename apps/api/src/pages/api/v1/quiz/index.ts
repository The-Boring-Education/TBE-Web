import type { NextApiRequest, NextApiResponse } from 'next';

import {
  addAQuizToDB,
  getQuizCategoriesFromDB,
  getQuizCategoriesWithCountsFromDB,
  appendQuestionsToQuizInDB,
} from '@/lib/database';
import { connectDB } from '@/middleware';
import { cors } from '@/lib/utils';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  try {
    await connectDB();

    switch (req.method) {
      case 'GET':
        return handleGetCategories(req, res);

      case 'POST':
        return handleCreateQuiz(req, res);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Quiz API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetCategories(req: NextApiRequest, res: NextApiResponse) {
  const { withCounts, includeInactive } = req.query;

  const useCounts = typeof withCounts === 'string' ? withCounts === 'true' : false;
  const includeInactiveQuizzes = typeof includeInactive === 'string' ? includeInactive === 'true' : false;
  
  const { data, error } = useCounts
    ? await getQuizCategoriesWithCountsFromDB(includeInactiveQuizzes)
    : await getQuizCategoriesFromDB(includeInactiveQuizzes);

  if (error) {
    return res.status(400).json({ error });
  }

  return res.status(200).json({ success: true, data });
}

async function handleCreateQuiz(req: NextApiRequest, res: NextApiResponse) {
  const {
    quizId,
    categoryName,
    categoryDescription,
    categoryIcon,
    questions,
    isActive = true,
  } = req.body;

  // If quizId is provided, append to existing quiz
  if (quizId) {
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields for append: questions',
      });
    }
    
    // Append questions to existing quiz
    const { data, error } = await appendQuestionsToQuizInDB(quizId, questions);
    
    if (error) {
      return res.status(400).json({ error });
    }
    
    return res.status(200).json({ 
      success: true, 
      data,
      message: `Successfully appended ${questions.length} questions to quiz`
    });
  }

  // Basic validation for new quiz creation
  if (
    !categoryName ||
    !categoryDescription ||
    !categoryIcon ||
    !questions
  ) {
    return res.status(400).json({
      error:
        'Missing required fields: categoryName, categoryDescription, categoryIcon, questions',
    });
  }

  // Ensure non-empty description
  if (
    typeof categoryDescription !== 'string' ||
    categoryDescription.trim().length === 0
  ) {
    return res
      .status(400)
      .json({ error: 'categoryDescription must be a non-empty string' });
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return res
      .status(400)
      .json({ error: 'Questions must be a non-empty array' });
  }

  // Normalize and validate each question
  type PartialQuestion = {
    question?: string;
    options?: string[];
    correctAnswer?: number;
    correct_answer?: number;
    explanation?: string;
    detailedExplanation?: string;
    difficulty?: 'easy' | 'medium' | 'hard' | string;
  };

  const errors: string[] = [];
  const normalizedQuestions = (questions as PartialQuestion[]).map((q, idx) => {
    const missing: string[] = [];
    const questionText = (q.question || '').trim();
    if (!questionText) missing.push('question');

    const options = Array.isArray(q.options) ? q.options : [];
    if (options.length < 2) missing.push('options(>=2)');

    const correctAnswer =
      typeof q.correctAnswer === 'number'
        ? q.correctAnswer
        : typeof q.correct_answer === 'number'
        ? q.correct_answer
        : undefined;
    if (typeof correctAnswer !== 'number') missing.push('correctAnswer');

    const explanation = (q.explanation || '').trim();
    if (!explanation) missing.push('explanation');

    const detailedExplanation = (q.detailedExplanation || '').trim();
    if (!detailedExplanation) missing.push('detailedExplanation');

    const difficulty = (q.difficulty || '').toString().toLowerCase();
    const difficultyValid = ['easy', 'medium', 'hard'].includes(difficulty);
    if (!difficultyValid) missing.push('difficulty(easy|medium|hard)');

    if (missing.length) {
      errors.push(`Question[${idx}] missing/invalid: ${missing.join(', ')}`);
    } else if (
      typeof correctAnswer === 'number' &&
      (correctAnswer < 0 || correctAnswer >= options.length)
    ) {
      errors.push(
        `Question[${idx}] correctAnswer out of bounds (0..${
          options.length - 1
        })`
      );
    }

    return {
      question: questionText,
      options,
      correctAnswer: typeof correctAnswer === 'number' ? correctAnswer : 0,
      explanation,
      detailedExplanation,
      difficulty: (difficultyValid ? difficulty : 'medium') as
        | 'easy'
        | 'medium'
        | 'hard',
    };
  });

  if (errors.length) {
    return res.status(400).json({ error: errors.join('; ') });
  }

  const quizData = {
    categoryName,
    categoryDescription,
    categoryIcon,
    questions: normalizedQuestions,
    isActive,
  };

  const { data, error, details } = await addAQuizToDB(quizData);

  if (error) {
    return res.status(400).json({ error, details });
  }

  return res.status(201).json({ success: true, data });
}

export default handler;
