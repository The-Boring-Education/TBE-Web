import { Quiz, QuizAttempt } from '@/database';
import type { QuizAttemptModel } from '@/database/models/Quiz/QuizAttempt';
import type { DatabaseQueryResponseType } from '@/interfaces';

// Get all quiz categories
export async function getQuizCategories(): Promise<DatabaseQueryResponseType> {
  try {
    const categories = await Quiz.find(
      { isActive: true },
      'categoryId categoryName categoryDescription categoryIcon'
    ).lean();

    return { data: categories };
  } catch (error) {
    return { error: 'Error fetching quiz categories' };
  }
}

// Get questions for a specific category
export async function getQuizByCategoryId(
  categoryId: string
): Promise<DatabaseQueryResponseType> {
  try {
    const quiz = await Quiz.findOne({ categoryId, isActive: true }).lean();

    if (!quiz) {
      return { error: 'Quiz category not found' };
    }

    return { data: quiz };
  } catch (error) {
    return { error: 'Error fetching quiz' };
  }
}

// Save quiz attempt
export async function saveQuizAttempt(
  attemptData: Partial<QuizAttemptModel>
): Promise<DatabaseQueryResponseType> {
  try {
    const attempt = new QuizAttempt(attemptData);
    const savedAttempt = await attempt.save();

    return { data: savedAttempt };
  } catch (error) {
    return { error: 'Error saving quiz attempt' };
  }
}

// Get user's quiz history
export async function getUserQuizHistory(
  userId: string,
  limit?: number,
  categoryId?: string
): Promise<DatabaseQueryResponseType> {
  try {
    let query = QuizAttempt.find({ userId });

    if (categoryId) {
      query = query.where('categoryId').equals(categoryId);
    }

    const attempts = await query
      .sort({ completedAt: -1 })
      .limit(limit || 20)
      .lean();

    return { data: attempts };
  } catch (error) {
    return { error: 'Error fetching quiz history' };
  }
}

// Get user's quiz statistics
export async function getUserQuizStats(
  userId: string
): Promise<DatabaseQueryResponseType> {
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
    return { error: 'Error fetching quiz statistics' };
  }
}

// Check if user has attempted a quiz today
export async function hasUserAttemptedQuizToday(
  userId: string
): Promise<DatabaseQueryResponseType> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attempt = await QuizAttempt.findOne({
      userId,
      completedAt: { $gte: today },
    });

    return { data: !!attempt };
  } catch (error) {
    return { error: 'Error checking quiz attempt' };
  }
}

// Get quiz streak for a user
export async function getUserQuizStreak(
  userId: string
): Promise<DatabaseQueryResponseType> {
  try {
    const attempts = await QuizAttempt.find({ userId })
      .sort({ completedAt: -1 })
      .select('completedAt')
      .lean();

    if (!attempts.length) {
      return { data: { currentStreak: 0, maxStreak: 0 } };
    }

    // Calculate streak
    let currentStreak = 0;
    let maxStreak = 0;
    let lastDate = new Date();
    lastDate.setHours(0, 0, 0, 0);

    for (const attempt of attempts) {
      const attemptDate = new Date(attempt.completedAt!);
      attemptDate.setHours(0, 0, 0, 0);

      const dayDiff = Math.floor(
        (lastDate.getTime() - attemptDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === 0 && currentStreak === 0) {
        currentStreak = 1;
      } else if (dayDiff === 1) {
        currentStreak++;
      } else if (dayDiff > 1) {
        maxStreak = Math.max(maxStreak, currentStreak);
        if (currentStreak > 0) break; // Current streak is broken
      }

      lastDate = attemptDate;
    }

    maxStreak = Math.max(maxStreak, currentStreak);

    return { data: { currentStreak, maxStreak } };
  } catch (error) {
    return { error: 'Error calculating quiz streak' };
  }
}
