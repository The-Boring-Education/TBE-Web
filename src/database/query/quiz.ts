import { Quiz, QuizAttempt } from '@/database';
import type { QuizModel } from '@/database/models/Quiz/Quiz';
import type { QuizAttemptModel } from '@/database/models/Quiz/QuizAttempt';
import type { DatabaseQueryResponseType } from '@/interfaces';

// Add a quiz to database
const addAQuizToDB = async (
  quizData: Omit<QuizModel, '_id' | 'createdAt' | 'updatedAt'>
): Promise<DatabaseQueryResponseType> => {
  try {
    const quiz = new Quiz(quizData);
    await quiz.save();
    return { data: quiz };
  } catch (error) {
    return { error: 'Failed while adding quiz' };
  }
};

// Update a quiz in database
const updateAQuizInDB = async ({
  categoryId,
  updatedData,
}: {
  categoryId: string;
  updatedData: Partial<
    Omit<QuizModel, '_id' | 'categoryId' | 'createdAt' | 'updatedAt'>
  >;
}): Promise<DatabaseQueryResponseType> => {
  try {
    const updatedQuiz = await Quiz.findOneAndUpdate(
      { categoryId },
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedQuiz) return { error: 'Quiz does not exist' };

    return { data: updatedQuiz };
  } catch (error) {
    return { error: 'Failed while updating quiz' };
  }
};

// Get all quiz categories from database
const getQuizCategoriesFromDB =
  async (): Promise<DatabaseQueryResponseType> => {
    try {
      const categories = await Quiz.find(
        { isActive: true },
        'categoryId categoryName categoryDescription categoryIcon'
      ).lean();

      return { data: categories };
    } catch (error) {
      return { error: 'Failed while fetching quiz categories' };
    }
  };

// Get quiz by category ID from database
const getQuizByCategoryIdFromDB = async (
  categoryId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const quiz = await Quiz.findOne({ categoryId, isActive: true }).lean();

    if (!quiz) {
      return { error: 'Quiz category not found' };
    }

    return { data: quiz };
  } catch (error) {
    return { error: 'Failed while fetching quiz' };
  }
};

// Get quiz categories with question counts
const getQuizCategoriesWithCountsFromDB = async (): Promise<DatabaseQueryResponseType> => {
  try {
    const categories = await Quiz.aggregate([
      { $match: { isActive: true } },
      {
        $project: {
          _id: 0,
          categoryId: 1,
          categoryName: 1,
          categoryDescription: 1,
          categoryIcon: 1,
          questionCount: { $size: { $ifNull: ['$questions', []] } },
        },
      },
    ]);

    return { data: categories };
  } catch (error) {
    return { error: 'Failed while fetching quiz categories with counts' };
  }
};

// Append questions to an existing quiz category
const appendQuestionsToQuizInDB = async (
  categoryId: string,
  questions: QuizModel['questions']
): Promise<DatabaseQueryResponseType> => {
  try {
    if (!Array.isArray(questions) || questions.length === 0) {
      return { error: 'Questions must be a non-empty array' };
    }

    const updated = await Quiz.findOneAndUpdate(
      { categoryId },
      { $push: { questions: { $each: questions } } },
      { new: true, runValidators: true }
    );

    if (!updated) return { error: 'Quiz category not found' };

    return { data: updated };
  } catch (error) {
    return { error: 'Failed while appending questions to quiz' };
  }
};

// Save quiz attempt to database
const saveQuizAttemptToDB = async (
  attemptData: Partial<QuizAttemptModel>
): Promise<DatabaseQueryResponseType> => {
  try {
    const attempt = new QuizAttempt(attemptData);
    const savedAttempt = await attempt.save();
    return { data: savedAttempt };
  } catch (error) {
    return { error: 'Failed while saving quiz attempt' };
  }
};

// Get user quiz history from database
const getUserQuizHistoryFromDB = async ({
  userId,
  limit = 20,
  categoryId,
}: {
  userId: string;
  limit?: number;
  categoryId?: string;
}): Promise<DatabaseQueryResponseType> => {
  try {
    let query = QuizAttempt.find({ userId });

    if (categoryId) {
      query = query.where('categoryId').equals(categoryId);
    }

    const attempts = await query.sort({ completedAt: -1 }).limit(limit).lean();

    return { data: attempts };
  } catch (error) {
    return { error: 'Failed while fetching quiz history' };
  }
};

// Get user quiz statistics from database
const getUserQuizStatsFromDB = async (
  userId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const stats = await QuizAttempt.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          totalPoints: { $sum: '$pointsEarned' },
          totalCorrectAnswers: { $sum: '$correctAnswers' },
          totalQuestions: { $sum: '$totalQuestions' },
          averageScore: { $avg: '$score' },
          averageTimeTaken: { $avg: '$timeTaken' },
        },
      },
      {
        $project: {
          _id: 0,
          totalQuizzes: 1,
          totalPoints: 1,
          totalCorrectAnswers: 1,
          totalQuestions: 1,
          averageScore: { $round: ['$averageScore', 2] },
          averageTimeTaken: { $round: ['$averageTimeTaken', 0] },
          overallAccuracy: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$totalCorrectAnswers', '$totalQuestions'] },
                  100,
                ],
              },
              2,
            ],
          },
        },
      },
    ]);

    const defaultStats = {
      totalQuizzes: 0,
      totalPoints: 0,
      totalCorrectAnswers: 0,
      totalQuestions: 0,
      averageScore: 0,
      averageTimeTaken: 0,
      overallAccuracy: 0,
    };

    return { data: stats[0] || defaultStats };
  } catch (error) {
    return { error: 'Failed while fetching quiz statistics' };
  }
};

export {
  addAQuizToDB,
  getQuizByCategoryIdFromDB,
  getQuizCategoriesFromDB,
  getQuizCategoriesWithCountsFromDB,
  getUserQuizHistoryFromDB,
  getUserQuizStatsFromDB,
  saveQuizAttemptToDB,
  updateAQuizInDB,
  appendQuestionsToQuizInDB,
};
