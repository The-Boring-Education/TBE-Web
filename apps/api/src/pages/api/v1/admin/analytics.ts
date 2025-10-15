import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/lib/constants';
import {
  Course,
  Feedback,
  Gamification,
  InterviewSheet,
  Notification,
  Payment,
  PrepLog,
  PrepYatraSubscription,
  Project,
  User,
  UserCourse,
  Webinar,
} from '@/lib/database';
import { sendAPIResponse } from '@/lib/utils';
import { cors } from '@/lib/utils';
import { connectDB } from '@/middleware';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await connectDB();

  const { method, query } = req;
  const { type, startDate, endDate, period = '30d' } = query;

  if (method !== 'GET') {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: `Method ${method} not allowed`,
      })
    );
  }

  return handleAnalyticsRequest(
    res,
    type as string,
    startDate as string,
    endDate as string,
    period as string
  );
};

const handleAnalyticsRequest = async (
  res: NextApiResponse,
  type: string,
  startDate: string,
  endDate: string,
  period: string
) => {
  try {
    const dateRange = getDateRange(startDate, endDate, period);

    switch (type) {
      case 'revenue':
        return await getRevenueAnalytics(res, dateRange);
      case 'user-engagement':
        return await getUserEngagementAnalytics(res, dateRange);
      case 'content-performance':
        return await getContentPerformanceAnalytics(res, dateRange);
      case 'operational':
        return await getOperationalMetrics(res, dateRange);
      case 'gamification':
        return await getGamificationAnalytics(res, dateRange);
      case 'learning-patterns':
        return await getLearningPatternAnalytics(res, dateRange);
      case 'platform-health':
        return await getPlatformHealthMetrics(res, dateRange);
      case 'user-sources':
        return await getUserSourceAnalytics(res, dateRange);
      default:
        return res.status(apiStatusCodes.BAD_REQUEST).json(
          sendAPIResponse({
            status: false,
            message: 'Invalid analytics type',
          })
        );
    }
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        error,
        message: 'Error fetching analytics data',
      })
    );
  }
};

const getDateRange = (startDate: string, endDate: string, period: string) => {
  const end = endDate ? new Date(endDate) : new Date();
  let start: Date;

  if (startDate) {
    start = new Date(startDate);
  } else {
    const days =
      period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  }

  return { start, end };
};

const getRevenueAnalytics = async (
  res: NextApiResponse,
  dateRange: { start: Date; end: Date }
) => {
  const { start, end } = dateRange;

  // Revenue trends
  const revenueData = await Payment.aggregate([
    {
      $match: {
        isPaid: true,
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        totalRevenue: { $sum: '$amount' },
        transactionCount: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  // Product-wise revenue
  const productRevenue = await Payment.aggregate([
    {
      $match: {
        isPaid: true,
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: '$productType',
        totalRevenue: { $sum: '$amount' },
        transactionCount: { $sum: 1 },
      },
    },
  ]);

  // Subscription metrics
  const subscriptionMetrics = await PrepYatraSubscription.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: '$type',
        totalSubscriptions: { $sum: 1 },
        totalRevenue: { $sum: '$amount' },
        activeSubscriptions: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
        },
      },
    },
  ]);

  // Revenue conversion funnel
  const totalUsers = await User.countDocuments({
    createdAt: { $gte: start, $lte: end },
  });

  const paidUsers = await Payment.distinct('user', {
    isPaid: true,
    createdAt: { $gte: start, $lte: end },
  });

  const conversionRate =
    totalUsers > 0 ? (paidUsers.length / totalUsers) * 100 : 0;

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        revenueTimeSeries: revenueData,
        productRevenue,
        subscriptionMetrics,
        totalRevenue: productRevenue.reduce(
          (sum, item) => sum + item.totalRevenue,
          0
        ),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        totalTransactions: productRevenue.reduce(
          (sum, item) => sum + item.transactionCount,
          0
        ),
        averageTransactionValue:
          productRevenue.length > 0
            ? productRevenue.reduce((sum, item) => sum + item.totalRevenue, 0) /
              productRevenue.reduce(
                (sum, item) => sum + item.transactionCount,
                0
              )
            : 0,
      },
    })
  );
};

const getUserEngagementAnalytics = async (
  res: NextApiResponse,
  dateRange: { start: Date; end: Date }
) => {
  const { start, end } = dateRange;

  // User growth over time
  const userGrowth = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        newUsers: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  // User engagement by role
  const engagementByRole = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: '$occupation',
        totalUsers: { $sum: 1 },
        onboardedUsers: {
          $sum: { $cond: [{ $eq: ['$isOnboarded', true] }, 1, 0] },
        },
      },
    },
  ]);

  // Course completion rates
  const courseCompletionRates = await UserCourse.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: '$courseId',
        totalEnrollments: { $sum: 1 },
        completedCourses: {
          $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] },
        },
      },
    },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course',
      },
    },
    {
      $unwind: '$course',
    },
    {
      $project: {
        courseName: '$course.name',
        completionRate: {
          $multiply: [
            { $divide: ['$completedCourses', '$totalEnrollments'] },
            100,
          ],
        },
        totalEnrollments: 1,
        completedCourses: 1,
      },
    },
  ]);

  // User activity patterns
  const activityPatterns = await UserCourse.aggregate([
    {
      $match: {
        updatedAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          hour: { $hour: '$updatedAt' },
          dayOfWeek: { $dayOfWeek: '$updatedAt' },
        },
        activityCount: { $sum: 1 },
      },
    },
  ]);

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        userGrowth,
        engagementByRole,
        courseCompletionRates,
        activityPatterns,
      },
    })
  );
};

const getContentPerformanceAnalytics = async (
  res: NextApiResponse,
  dateRange: { start: Date; end: Date }
) => {
  const { start, end } = dateRange;

  // Most popular courses
  const popularCourses = await UserCourse.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: '$courseId',
        enrollmentCount: { $sum: 1 },
        completionCount: {
          $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] },
        },
      },
    },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course',
      },
    },
    {
      $unwind: '$course',
    },
    {
      $sort: { enrollmentCount: -1 },
    },
    {
      $limit: 10,
    },
  ]);

  // Feedback analysis
  const feedbackAnalysis = await Feedback.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: '$type',
        averageRating: { $avg: '$rating' },
        totalFeedback: { $sum: 1 },
        ratings: {
          $push: '$rating',
        },
      },
    },
  ]);

  // Chapter engagement
  const chapterEngagement = await UserCourse.aggregate([
    {
      $match: {
        updatedAt: { $gte: start, $lte: end },
      },
    },
    {
      $unwind: '$chapters',
    },
    {
      $group: {
        _id: '$chapters.chapterId',
        totalViews: { $sum: 1 },
        completions: {
          $sum: { $cond: [{ $eq: ['$chapters.isCompleted', true] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        completionRate: {
          $multiply: [{ $divide: ['$completions', '$totalViews'] }, 100],
        },
        totalViews: 1,
        completions: 1,
      },
    },
    {
      $sort: { completionRate: -1 },
    },
  ]);

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        popularCourses,
        feedbackAnalysis,
        chapterEngagement,
      },
    })
  );
};

const getGamificationAnalytics = async (
  res: NextApiResponse,
  dateRange: { start: Date; end: Date }
) => {
  const { start, end } = dateRange;

  // Points distribution
  const pointsDistribution = await Gamification.aggregate([
    {
      $match: {
        updatedAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $lt: ['$points', 500] }, then: 'Beginner (0-499)' },
              {
                case: { $lt: ['$points', 1000] },
                then: 'Intermediate (500-999)',
              },
              {
                case: { $lt: ['$points', 2000] },
                then: 'Advanced (1000-1999)',
              },
              { case: { $gte: ['$points', 2000] }, then: 'Expert (2000+)' },
            ],
            default: 'Unknown',
          },
        },
        userCount: { $sum: 1 },
        averagePoints: { $avg: '$points' },
      },
    },
  ]);

  // Action performance
  const actionPerformance = await Gamification.aggregate([
    {
      $match: {
        updatedAt: { $gte: start, $lte: end },
      },
    },
    {
      $unwind: '$actions',
    },
    {
      $group: {
        _id: '$actions.actionType',
        totalActions: { $sum: 1 },
        totalPoints: { $sum: '$actions.pointsEarned' },
        averagePoints: { $avg: '$actions.pointsEarned' },
      },
    },
    {
      $sort: { totalActions: -1 },
    },
  ]);

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        pointsDistribution,
        actionPerformance,
      },
    })
  );
};

const getLearningPatternAnalytics = async (
  res: NextApiResponse,
  dateRange: { start: Date; end: Date }
) => {
  const { start, end } = dateRange;

  // Learning time analysis
  const learningTimeAnalysis = await PrepLog.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: '$user',
        totalTimeSpent: { $sum: '$timeSpent' },
        sessionCount: { $sum: 1 },
        averageSessionTime: { $avg: '$timeSpent' },
      },
    },
    {
      $group: {
        _id: null,
        totalLearners: { $sum: 1 },
        totalTimeSpent: { $sum: '$totalTimeSpent' },
        averageTimePerLearner: { $avg: '$totalTimeSpent' },
        averageSessionTime: { $avg: '$averageSessionTime' },
      },
    },
  ]);

  // Learning streaks
  const learningStreaks = await PrepLog.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          user: '$user',
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
            },
          },
        },
        dailyTime: { $sum: '$timeSpent' },
      },
    },
    {
      $group: {
        _id: '$_id.user',
        activeDays: { $sum: 1 },
        totalTime: { $sum: '$dailyTime' },
      },
    },
    {
      $group: {
        _id: null,
        averageActiveDays: { $avg: '$activeDays' },
        totalActiveLearners: { $sum: 1 },
      },
    },
  ]);

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        learningTimeAnalysis,
        learningStreaks,
      },
    })
  );
};

const getOperationalMetrics = async (
  res: NextApiResponse,
  dateRange: { start: Date; end: Date }
) => {
  const { start, end } = dateRange;

  // System health metrics
  const totalNotifications = await Notification.countDocuments({
    createdAt: { $gte: start, $lte: end },
  });

  const totalFeedback = await Feedback.countDocuments({
    createdAt: { $gte: start, $lte: end },
  });

  const averageRating = await Feedback.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  // Content creation metrics
  const contentCreation = await Promise.all([
    Course.countDocuments({ createdAt: { $gte: start, $lte: end } }),
    Project.countDocuments({ createdAt: { $gte: start, $lte: end } }),
    InterviewSheet.countDocuments({ createdAt: { $gte: start, $lte: end } }),
    Webinar.countDocuments({ createdAt: { $gte: start, $lte: end } }),
  ]);

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        totalNotifications,
        totalFeedback,
        averageRating: averageRating[0]?.averageRating || 0,
        contentCreation: {
          courses: contentCreation[0],
          projects: contentCreation[1],
          interviewSheets: contentCreation[2],
          webinars: contentCreation[3],
        },
      },
    })
  );
};

const getPlatformHealthMetrics = async (
  res: NextApiResponse,
  dateRange: { start: Date; end: Date }
) => {
  const { start, end } = dateRange;

  // Database health
  const dbHealthMetrics = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    UserCourse.countDocuments(),
    Payment.countDocuments(),
    Feedback.countDocuments(),
  ]);

  // Recent activity
  const recentActivity = await Promise.all([
    User.countDocuments({ createdAt: { $gte: start, $lte: end } }),
    UserCourse.countDocuments({ createdAt: { $gte: start, $lte: end } }),
    Payment.countDocuments({ createdAt: { $gte: start, $lte: end } }),
    Feedback.countDocuments({ createdAt: { $gte: start, $lte: end } }),
  ]);

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        dbHealthMetrics: {
          totalUsers: dbHealthMetrics[0],
          totalCourses: dbHealthMetrics[1],
          totalEnrollments: dbHealthMetrics[2],
          totalPayments: dbHealthMetrics[3],
          totalFeedback: dbHealthMetrics[4],
        },
        recentActivity: {
          newUsers: recentActivity[0],
          newEnrollments: recentActivity[1],
          newPayments: recentActivity[2],
          newFeedback: recentActivity[3],
        },
      },
    })
  );
};

const getUserSourceAnalytics = async (
  res: NextApiResponse,
  dateRange: { start: Date; end: Date }
) => {
  try {
    const { start, end } = dateRange;
    
    // Get user source breakdown
    const sourceBreakdown = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: '$from',
          userCount: { $sum: 1 },
        },
      },
      {
        $sort: { userCount: -1 },
      },
    ]);

    // Get total users in date range
    const totalUsers = await User.countDocuments({
      createdAt: {
        $gte: start,
        $lte: end,
      },
    });

    // Calculate percentages and format data
    const sourceBreakdownWithPercentage = sourceBreakdown.map((item) => ({
      source: item._id || 'direct',
      userCount: item.userCount,
      percentage: totalUsers > 0 ? parseFloat(((item.userCount / totalUsers) * 100).toFixed(2)) : 0,
    }));

    // Find top source
    const topSource = sourceBreakdownWithPercentage.length > 0 
      ? sourceBreakdownWithPercentage[0] 
      : { source: 'direct', userCount: 0, percentage: 0 };

    // Get 7-day growth for each source
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const previousWeekSourceBreakdown = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: sevenDaysAgo,
            $lt: start,
          },
        },
      },
      {
        $group: {
          _id: '$from',
          userCount: { $sum: 1 },
        },
      },
    ]);

    // Calculate growth for each source
    const sourceBreakdownWithGrowth = sourceBreakdownWithPercentage.map((current) => {
      const previous = previousWeekSourceBreakdown.find(p => p._id === current.source);
      const previousCount = previous ? previous.userCount : 0;
      const growth = previousCount > 0 
        ? parseFloat((((current.userCount - previousCount) / previousCount) * 100).toFixed(2))
        : current.userCount > 0 ? 100 : 0;

      return {
        ...current,
        growth,
      };
    });

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: {
          sourceBreakdown: sourceBreakdownWithGrowth,
          totalUsers,
          topSource: topSource?.source,
          topSourceCount: topSource?.userCount,
          topSourcePercentage: topSource?.percentage,
          dateRange: {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          },
        },
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Error fetching user source analytics',
        error,
      })
    );
  }
};

export default handler;
