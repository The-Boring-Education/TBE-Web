import { Quiz, QuizAttempt } from '@/database';
import QuizSession from '@/database/models/Quiz/QuizSession';
import UserQuestionPerformance from '@/database/models/Quiz/UserQuestionPerformance';
import UserQuizAnalytics from '@/database/models/Quiz/UserQuizAnalytics';
import type { QuizSessionModel, QuizSessionQuestion } from '@/database/models/Quiz/QuizSession';
import type { UserQuestionPerformanceModel } from '@/database/models/Quiz/UserQuestionPerformance';
import type { UserQuizAnalyticsModel } from '@/database/models/Quiz/UserQuizAnalytics';
import type { QuizModel } from '@/database/models/Quiz/Quiz';
import type { DatabaseQueryResponseType } from '@/interfaces';
import { Types } from 'mongoose';

// ====================
// Quiz Session Management
// ====================

// Create a new quiz session with intelligent question selection
const createQuizSessionInDB = async ({
  userId,
  quizId,
  difficulty,
  questionCount
}: {
  userId: string;
  quizId: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionCount: number;
}): Promise<DatabaseQueryResponseType> => {
  try {
    // Get the full quiz
    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz || !quiz.isActive) {
      return { error: 'Quiz not found or inactive' };
    }

    // Get user's performance data for intelligent selection
    const userPerformance = await UserQuestionPerformance.find({ userId }).lean();
    
    // Select questions intelligently
    const selectedQuestions = await selectQuestionsIntelligently({
      quiz,
      difficulty,
      questionCount,
      userPerformance
    });

    if (selectedQuestions.length === 0) {
      return { error: 'No questions available for the selected difficulty' };
    }

    // Create session
    const sessionData: Omit<QuizSessionModel, '_id' | 'createdAt' | 'updatedAt'> = {
      userId: new Types.ObjectId(userId),
      quizId: new Types.ObjectId(quizId),
      categoryName: quiz.categoryName,
      difficulty,
      questionCount: selectedQuestions.length,
      questions: selectedQuestions,
      status: 'in_progress',
      startedAt: new Date(),
    };

    const session = new QuizSession(sessionData);
    await session.save();

    return { data: session };
  } catch (error) {
    console.error('Error creating quiz session:', error);
    return { error: 'Failed to create quiz session' };
  }
};

// Intelligent question selection algorithm
const selectQuestionsIntelligently = async ({
  quiz,
  difficulty,
  questionCount,
  userPerformance
}: {
  quiz: QuizModel;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionCount: number;
  userPerformance: UserQuestionPerformanceModel[];
}): Promise<QuizSessionQuestion[]> => {
  let availableQuestions = quiz.questions || [];

  // Filter by difficulty
  if (difficulty !== 'mixed') {
    availableQuestions = availableQuestions.filter(q => q.difficulty === difficulty);
  }

  // Create performance map for quick lookup
  const performanceMap = new Map(
    userPerformance.map(p => [p.questionId.toString(), p])
  );

  // Calculate weights for each question
  const weightedQuestions = availableQuestions.map(question => {
    let weight = 1.0;
    const questionId = (question as any)._id || Math.random().toString();
    const performance = performanceMap.get(questionId);

    if (performance) {
      // Spaced repetition check - higher weight if due for review
      if (performance.nextReviewDate <= new Date()) {
        weight *= 2.0;
      }

      // Recent question penalty - reduce weight if attempted recently
      const daysSinceLastAttempt = Math.floor(
        (Date.now() - performance.lastAttemptedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastAttempt < 7) {
        weight *= 0.5;
      }

      // Weak area bias - increase weight for areas with low strength
      if (performance.strengthLevel < 0.6) {
        weight *= 1.5;
      }
    } else {
      // New question - slight boost
      weight *= 1.2;
    }

    return { question, weight };
  });

  // Sort by weight and select top questions
  weightedQuestions.sort((a, b) => b.weight - a.weight);
  
  const selectedQuestions = weightedQuestions
    .slice(0, questionCount)
    .map(({ question }, index) => ({
      questionId: new Types.ObjectId((question as any)._id || Math.random().toString()),
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      difficulty: question.difficulty,
      explanation: question.explanation,
      detailedExplanation: question.detailedExplanation,
    }));

  return selectedQuestions;
};

// Submit answer for a question in a session
const submitAnswerInDB = async ({
  sessionId,
  questionIndex,
  answer,
  timeSpent
}: {
  sessionId: string;
  questionIndex: number;
  answer: number;
  timeSpent: number;
}): Promise<DatabaseQueryResponseType> => {
  try {
    const session = await QuizSession.findById(sessionId);
    if (!session || session.status !== 'in_progress') {
      return { error: 'Session not found or not active' };
    }

    const question = session.questions[questionIndex];
    if (!question) {
      return { error: 'Question not found' };
    }

    const isCorrect = answer === question.correctAnswer;

    // Update question in session
    session.questions[questionIndex] = {
      ...question,
      userAnswer: answer,
      isCorrect,
      timeSpent,
      answeredAt: new Date(),
    };

    await session.save();

    // Update user question performance
    await updateUserQuestionPerformance({
      userId: session.userId.toString(),
      questionId: question.questionId.toString(),
      categoryName: session.categoryName,
      difficulty: question.difficulty,
      isCorrect,
      timeSpent,
    });

    return { 
      data: {
        isCorrect,
        explanation: question.explanation,
        detailedExplanation: question.detailedExplanation,
      }
    };
  } catch (error) {
    console.error('Error submitting answer:', error);
    return { error: 'Failed to submit answer' };
  }
};

// Complete a quiz session
const completeQuizSessionInDB = async (sessionId: string): Promise<DatabaseQueryResponseType> => {
  try {
    const session = await QuizSession.findById(sessionId);
    if (!session) {
      return { error: 'Session not found' };
    }

    const answeredQuestions = session.questions.filter(q => q.userAnswer !== undefined);
    const correctAnswers = answeredQuestions.filter(q => q.isCorrect).length;
    const totalTime = answeredQuestions.reduce((sum, q) => sum + (q.timeSpent || 0), 0);
    const score = Math.round((correctAnswers / answeredQuestions.length) * 100);

    // Update session
    session.status = 'completed';
    session.completedAt = new Date();
    session.totalTime = totalTime;
    session.score = score;
    session.percentage = score;

    await session.save();

    // Create traditional quiz attempt for backward compatibility
    const attemptData = {
      userId: session.userId,
      quizId: session.quizId,
      categoryName: session.categoryName,
      answers: session.questions.map((q, index) => ({
        questionIndex: index,
        selectedAnswer: q.userAnswer || -1,
        isCorrect: q.isCorrect || false,
        timeSpent: q.timeSpent || 0,
      })),
      score,
      correctAnswers,
      totalQuestions: answeredQuestions.length,
      timeTaken: totalTime,
      pointsEarned: correctAnswers * 10,
      completedAt: new Date(),
    };

    await QuizAttempt.create(attemptData);

    // Update user analytics
    await updateUserAnalyticsInDB({
      userId: session.userId.toString(),
      categoryName: session.categoryName,
      score,
      difficulty: session.difficulty,
      timeSpent: totalTime,
    });

    return { data: session };
  } catch (error) {
    console.error('Error completing session:', error);
    return { error: 'Failed to complete session' };
  }
};

// ====================
// User Performance Tracking
// ====================

// Update user question performance (implements spaced repetition)
const updateUserQuestionPerformance = async ({
  userId,
  questionId,
  categoryName,
  difficulty,
  isCorrect,
  timeSpent,
}: {
  userId: string;
  questionId: string;
  categoryName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isCorrect: boolean;
  timeSpent: number;
}): Promise<void> => {
  try {
    let performance = await UserQuestionPerformance.findOne({ userId, questionId });

    if (!performance) {
      performance = new UserQuestionPerformance({
        userId,
        questionId,
        categoryName,
        difficulty,
        attempts: 0,
        correctAttempts: 0,
        averageTime: 0,
        lastAttemptedAt: new Date(),
        strengthLevel: 0,
        nextReviewDate: new Date(),
        easeFactor: 2.5,
        interval: 1,
      });
    }

    // Update basic stats
    performance.attempts++;
    if (isCorrect) {
      performance.correctAttempts++;
    }

    // Update average time
    performance.averageTime = 
      (performance.averageTime * (performance.attempts - 1) + timeSpent) / performance.attempts;

    // Update strength level (0-1 scale)
    performance.strengthLevel = performance.correctAttempts / performance.attempts;

    // Update spaced repetition parameters (SuperMemo-2 algorithm)
    updateSpacedRepetition(performance, isCorrect, timeSpent);

    performance.lastAttemptedAt = new Date();

    await performance.save();
  } catch (error) {
    console.error('Error updating question performance:', error);
  }
};

// SuperMemo-2 spaced repetition algorithm
const updateSpacedRepetition = (
  performance: UserQuestionPerformanceModel,
  isCorrect: boolean,
  timeSpent: number
): void => {
  if (isCorrect) {
    if (performance.interval === 1) {
      performance.interval = 6;
    } else {
      performance.interval = Math.round(performance.interval * performance.easeFactor);
    }

    // Adjust ease factor based on response quality (time-based)
    const responseQuality = timeSpent < 10 ? 5 : timeSpent < 20 ? 4 : timeSpent < 30 ? 3 : 2;
    performance.easeFactor = Math.max(
      1.3,
      performance.easeFactor + (0.1 - (5 - responseQuality) * (0.08 + (5 - responseQuality) * 0.02))
    );
  } else {
    // Reset interval for incorrect answers
    performance.interval = 1;
    performance.easeFactor = Math.max(1.3, performance.easeFactor - 0.2);
  }

  // Calculate next review date
  performance.nextReviewDate = new Date(Date.now() + performance.interval * 24 * 60 * 60 * 1000);
};

// ====================
// Analytics
// ====================

// Update user analytics
const updateUserAnalyticsInDB = async ({
  userId,
  categoryName,
  score,
  difficulty,
  timeSpent,
}: {
  userId: string;
  categoryName: string;
  score: number;
  difficulty: string;
  timeSpent: number;
}): Promise<void> => {
  try {
    let analytics = await UserQuizAnalytics.findOne({ userId, categoryName });

    if (!analytics) {
      analytics = new UserQuizAnalytics({
        userId,
        categoryName,
        totalAttempts: 0,
        bestScore: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        strengthAreas: [],
        improvementAreas: [],
        difficultyPerformance: {
          easy: { attempts: 0, successRate: 0 },
          medium: { attempts: 0, successRate: 0 },
          hard: { attempts: 0, successRate: 0 },
        },
        progressTimeline: [],
        lastAttemptAt: new Date(),
      });
    }

    // Update basic stats
    analytics.totalAttempts++;
    analytics.bestScore = Math.max(analytics.bestScore, score);
    analytics.averageScore = 
      (analytics.averageScore * (analytics.totalAttempts - 1) + score) / analytics.totalAttempts;
    analytics.totalTimeSpent += timeSpent;

    // Update difficulty performance
    if (difficulty !== 'mixed' && ['easy', 'medium', 'hard'].includes(difficulty)) {
      const diffKey = difficulty as 'easy' | 'medium' | 'hard';
      analytics.difficultyPerformance[diffKey].attempts++;
      const successRate = score >= 70 ? 1 : 0;
      analytics.difficultyPerformance[diffKey].successRate = 
        (analytics.difficultyPerformance[diffKey].successRate * 
         (analytics.difficultyPerformance[diffKey].attempts - 1) + successRate) / 
        analytics.difficultyPerformance[diffKey].attempts;
    }

    // Add to progress timeline (keep last 30 entries)
    analytics.progressTimeline.push({
      date: new Date(),
      score,
      difficulty,
      timeSpent,
    });

    if (analytics.progressTimeline.length > 30) {
      analytics.progressTimeline = analytics.progressTimeline.slice(-30);
    }

    analytics.lastAttemptAt = new Date();

    await analytics.save();
  } catch (error) {
    console.error('Error updating analytics:', error);
  }
};

// Get user analytics
const getUserAnalyticsFromDB = async (
  userId: string,
  categoryName?: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const filter: any = { userId };
    if (categoryName) {
      filter.categoryName = categoryName;
    }

    const analytics = await UserQuizAnalytics.find(filter).lean();
    return { data: analytics };
  } catch (error) {
    return { error: 'Failed to fetch user analytics' };
  }
};

// Get leaderboard
const getLeaderboardFromDB = async (
  categoryName?: string,
  limit: number = 50
): Promise<DatabaseQueryResponseType> => {
  try {
    const matchFilter: any = {};
    if (categoryName) {
      matchFilter.categoryName = categoryName;
    }

    const leaderboard = await UserQuizAnalytics.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: 1,
          userName: '$user.name',
          userImage: '$user.image',
          categoryName: 1,
          totalScore: '$bestScore',
          totalAttempts: 1,
          averageScore: 1,
          bestStreak: { $literal: 0 }, // TODO: Calculate from attempts
        },
      },
      { $sort: { totalScore: -1, averageScore: -1 } },
      { $limit: limit },
      {
        $addFields: {
          rank: { $add: [{ $indexOfArray: [[], null] }, 1] },
          badgeLevel: {
            $switch: {
              branches: [
                { case: { $gte: ['$totalScore', 90] }, then: 'platinum' },
                { case: { $gte: ['$totalScore', 80] }, then: 'gold' },
                { case: { $gte: ['$totalScore', 70] }, then: 'silver' },
              ],
              default: 'bronze',
            },
          },
        },
      },
    ]);

    return { data: leaderboard };
  } catch (error) {
    return { error: 'Failed to fetch leaderboard' };
  }
};

// Get user quiz sessions
const getUserQuizSessionsFromDB = async (
  userId: string,
  status?: 'in_progress' | 'completed' | 'abandoned'
): Promise<DatabaseQueryResponseType> => {
  try {
    const filter: any = { userId };
    if (status) {
      filter.status = status;
    }

    const sessions = await QuizSession.find(filter)
      .sort({ startedAt: -1 })
      .lean();

    return { data: sessions };
  } catch (error) {
    return { error: 'Failed to fetch user sessions' };
  }
};

export {
  createQuizSessionInDB,
  submitAnswerInDB,
  completeQuizSessionInDB,
  updateUserQuestionPerformance,
  updateUserAnalyticsInDB,
  getUserAnalyticsFromDB,
  getLeaderboardFromDB,
  getUserQuizSessionsFromDB,
};