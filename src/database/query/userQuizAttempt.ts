import { QuizAttempt } from '@/database';
import type { DatabaseQueryResponseType } from '@/interfaces';
import { Schema } from 'mongoose';

interface QuizAttemptData {
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  totalTimeSpent: number;
  answers: any[];
  categoryName: string;
  completedAt: string;
}

interface UserPerformanceStats {
  totalAttempts: number;
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  categoryBreakdown: {
    categoryName: string;
    attempts: number;
    averageScore: number;
    bestScore: number;
  }[];
  recentAttempts: {
    _id: string;
    quizId: string;
    categoryName: string;
    score: number;
    completedAt: string;
    totalTimeSpent: number;
  }[];
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  averageScore: number;
  totalAttempts: number;
  bestScore: number;
  totalTimeSpent: number;
}

// Add a new quiz attempt
export const addUserQuizAttemptToDB = async (
  attemptData: QuizAttemptData
): Promise<DatabaseQueryResponseType> => {
  try {
    const attempt = new QuizAttempt({
      userId: new Schema.Types.ObjectId(attemptData.userId),
      quizId: new Schema.Types.ObjectId(attemptData.quizId),
      score: attemptData.score,
      totalQuestions: attemptData.totalQuestions,
      correctAnswers: attemptData.correctAnswers,
      timeTaken: attemptData.totalTimeSpent, // Fix: use timeTaken instead of totalTimeSpent
      answers: attemptData.answers,
      categoryName: attemptData.categoryName,
      pointsEarned: Math.round((attemptData.correctAnswers / attemptData.totalQuestions) * 100), // Add missing pointsEarned
      completedAt: new Date(attemptData.completedAt)
    });

    const savedAttempt = await attempt.save();
    return { data: savedAttempt };
  } catch (error) {
    console.error('Error saving quiz attempt:', error);
    console.error('Attempt data that failed:', JSON.stringify(attemptData, null, 2));
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return { error: 'Failed to save quiz attempt' };
  }
};

// Get user's quiz performance analytics
export const getUserQuizPerformanceFromDB = async (
  userId: string
): Promise<DatabaseQueryResponseType<UserPerformanceStats>> => {
  try {
    const attempts = await QuizAttempt.find({ 
      userId: new Schema.Types.ObjectId(userId) 
    })
    .sort({ completedAt: -1 })
    .lean();

    if (attempts.length === 0) {
      return {
        data: {
          totalAttempts: 0,
          totalQuizzes: 0,
          averageScore: 0,
          bestScore: 0,
          totalTimeSpent: 0,
          categoryBreakdown: [],
          recentAttempts: []
        }
      };
    }

    // Calculate overall stats
    const totalAttempts = attempts.length;
    const uniqueQuizzes = new Set(attempts.map(a => a.quizId.toString())).size;
    const averageScore = Math.round(
      attempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts
    );
    const bestScore = Math.max(...attempts.map(a => a.score));
    const totalTimeSpent = attempts.reduce((sum, attempt) => sum + (attempt.totalTimeSpent || 0), 0);

    // Category breakdown
    const categoryMap = new Map<string, { scores: number[], attempts: number }>();
    
    attempts.forEach(attempt => {
      const category = attempt.categoryName;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { scores: [], attempts: 0 });
      }
      const categoryData = categoryMap.get(category)!;
      categoryData.scores.push(attempt.score);
      categoryData.attempts++;
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([categoryName, data]) => ({
      categoryName,
      attempts: data.attempts,
      averageScore: Math.round(data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length),
      bestScore: Math.max(...data.scores)
    }));

    // Recent attempts (last 10)
    const recentAttempts = attempts.slice(0, 10).map(attempt => ({
      _id: attempt._id.toString(),
      quizId: attempt.quizId.toString(),
      categoryName: attempt.categoryName,
      score: attempt.score,
      completedAt: attempt.completedAt.toISOString(),
      totalTimeSpent: attempt.totalTimeSpent || 0
    }));

    const performanceStats: UserPerformanceStats = {
      totalAttempts,
      totalQuizzes: uniqueQuizzes,
      averageScore,
      bestScore,
      totalTimeSpent,
      categoryBreakdown,
      recentAttempts
    };

    return { data: performanceStats };
  } catch (error) {
    console.error('Error getting user performance:', error);
    return { error: 'Failed to get user performance' };
  }
};

// Get quiz leaderboard
export const getQuizLeaderboardFromDB = async ({
  limit = 50,
  category
}: {
  limit?: number;
  category?: string;
}): Promise<DatabaseQueryResponseType<LeaderboardEntry[]>> => {
  try {
    const matchStage: any = {};
    if (category) {
      matchStage.categoryName = category;
    }

    const leaderboard = await QuizAttempt.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$userId',
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$score' },
          bestScore: { $max: '$score' },
          totalTimeSpent: { $sum: '$totalTimeSpent' }
        }
      },
      {
        $lookup: {
          from: 'users', // Assuming you have a users collection
          localField: '_id',
          foreignField: '_id',
          as: 'user',
          pipeline: [{ $project: { name: 1, email: 1 } }]
        }
      },
      {
        $addFields: {
          username: {
            $ifNull: [
              { $arrayElemAt: ['$user.name', 0] },
              { $arrayElemAt: ['$user.email', 0] }
            ]
          }
        }
      },
      {
        $project: {
          userId: '$_id',
          username: 1,
          averageScore: { $round: ['$averageScore', 1] },
          totalAttempts: 1,
          bestScore: 1,
          totalTimeSpent: 1
        }
      },
      { $sort: { averageScore: -1, bestScore: -1, totalAttempts: -1 } },
      { $limit: limit }
    ]);

    const leaderboardWithFallback = leaderboard.map((entry, index) => ({
      ...entry,
      username: entry.username || `User ${entry.userId.toString().slice(-6)}`,
      rank: index + 1
    }));

    return { data: leaderboardWithFallback };
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return { error: 'Failed to get leaderboard' };
  }
};

// Get admin analytics for quiz system
export const getQuizAdminAnalyticsFromDB = async (): Promise<DatabaseQueryResponseType> => {
  try {
    const [totalAttempts, uniqueUsers, totalCategories, avgTimePerQuiz] = await Promise.all([
      QuizAttempt.countDocuments(),
      QuizAttempt.distinct('userId').then(users => users.length),
      QuizAttempt.distinct('categoryName').then(categories => categories.length),
      QuizAttempt.aggregate([
        { $group: { _id: null, avgTime: { $avg: '$totalTimeSpent' } } }
      ]).then(result => result[0]?.avgTime || 0)
    ]);

    // Category performance
    const categoryStats = await QuizAttempt.aggregate([
      {
        $group: {
          _id: '$categoryName',
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$score' },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $addFields: {
          uniqueUserCount: { $size: '$uniqueUsers' }
        }
      },
      {
        $project: {
          categoryName: '$_id',
          totalAttempts: 1,
          averageScore: { $round: ['$averageScore', 1] },
          uniqueUsers: '$uniqueUserCount'
        }
      },
      { $sort: { totalAttempts: -1 } }
    ]);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = await QuizAttempt.aggregate([
      { $match: { completedAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 },
          avgScore: { $avg: '$score' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const analytics = {
      overview: {
        totalAttempts,
        uniqueUsers,
        totalCategories,
        avgTimePerQuiz: Math.round(avgTimePerQuiz)
      },
      categoryStats,
      recentActivity
    };

    return { data: analytics };
  } catch (error) {
    console.error('Error getting admin analytics:', error);
    return { error: 'Failed to get admin analytics' };
  }
};