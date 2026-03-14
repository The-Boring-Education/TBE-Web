import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  Gamification,
  Payment,
  User,
  UserCourse,
  UserProject,
  UserSheet,
} from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const {
    action,
    userId,
    segment,
    page = "1",
    limit = "20",
    startDate,
    endDate,
    sortBy = "createdAt",
    order = "desc",
  } = query;

  if (method !== "GET") {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: `Method ${method} not allowed`,
      }),
    );
  }

  return handleUserManagementRequest(
    res,
    action as string,
    userId as string,
    segment as string,
    parseInt(page as string),
    parseInt(limit as string),
    startDate as string,
    endDate as string,
    sortBy as string,
    order as string,
  );
};

const handleUserManagementRequest = async (
  res: NextApiResponse,
  action: string,
  userId: string,
  segment: string,
  page: number,
  limit: number,
  startDate: string,
  endDate: string,
  sortBy: string,
  order: string,
) => {
  try {
    const dateRange = getDateRange(startDate, endDate);
    const sortOrder = order === "desc" ? -1 : 1;

    switch (action) {
      case "segments":
        return await getUserSegments(res, dateRange);
      case "details":
        return await getUserDetails(res, userId);
      case "activity":
        return await getUserActivity(res, userId, dateRange);
      case "cohort-analysis":
        return await getCohortAnalysis(res, dateRange);
      case "retention":
        return await getRetentionAnalysis(res, dateRange);
      case "engagement-score":
        return await getEngagementScores(res, dateRange);
      case "list":
        return await getFilteredUsers(
          res,
          segment,
          page,
          limit,
          sortBy,
          sortOrder,
          dateRange,
        );
      case "growth":
        return await getUserGrowthAnalysis(res, dateRange);
      case "demographics":
        return await getUserDemographics(res, dateRange);
      default:
        return res.status(apiStatusCodes.BAD_REQUEST).json(
          sendAPIResponse({
            status: false,
            message: "Invalid action specified",
          }),
        );
    }
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        error,
        message: "Error processing user management request",
      }),
    );
  }
};

const getDateRange = (startDate: string, endDate: string) => {
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate
    ? new Date(startDate)
    : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { start, end };
};

const getUserSegments = async (
  res: NextApiResponse,
  dateRange: { start: Date; end: Date },
) => {
  const { start, end } = dateRange;

  // User segments by activity level
  const activitySegments = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $lookup: {
        from: "usercourses",
        localField: "_id",
        foreignField: "userId",
        as: "courses",
      },
    },
    {
      $lookup: {
        from: "userprojects",
        localField: "_id",
        foreignField: "userId",
        as: "projects",
      },
    },
    {
      $lookup: {
        from: "usersheets",
        localField: "_id",
        foreignField: "userId",
        as: "sheets",
      },
    },
    {
      $addFields: {
        totalEnrollments: {
          $add: [
            { $size: "$courses" },
            { $size: "$projects" },
            { $size: "$sheets" },
          ],
        },
      },
    },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              {
                case: { $eq: ["$totalEnrollments", 0] },
                then: "Inactive",
              },
              {
                case: { $lte: ["$totalEnrollments", 2] },
                then: "Low Activity",
              },
              {
                case: { $lte: ["$totalEnrollments", 5] },
                then: "Medium Activity",
              },
              {
                case: { $gt: ["$totalEnrollments", 5] },
                then: "High Activity",
              },
            ],
            default: "Unknown",
          },
        },
        userCount: { $sum: 1 },
        averageEnrollments: { $avg: "$totalEnrollments" },
      },
    },
  ]);

  // User segments by role
  const roleSegments = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: "$occupation",
        userCount: { $sum: 1 },
        onboardedCount: {
          $sum: { $cond: [{ $eq: ["$isOnboarded", true] }, 1, 0] },
        },
      },
    },
  ]);

  // Revenue segments
  const revenueSegments = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $lookup: {
        from: "payments",
        localField: "_id",
        foreignField: "user",
        as: "payments",
      },
    },
    {
      $addFields: {
        totalSpent: {
          $sum: {
            $map: {
              input: "$payments",
              as: "payment",
              in: {
                $cond: [
                  { $eq: ["$$payment.isPaid", true] },
                  "$$payment.amount",
                  0,
                ],
              },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              {
                case: { $eq: ["$totalSpent", 0] },
                then: "Free Users",
              },
              {
                case: { $lte: ["$totalSpent", 1000] },
                then: "Low Value",
              },
              {
                case: { $lte: ["$totalSpent", 5000] },
                then: "Medium Value",
              },
              {
                case: { $gt: ["$totalSpent", 5000] },
                then: "High Value",
              },
            ],
            default: "Unknown",
          },
        },
        userCount: { $sum: 1 },
        totalRevenue: { $sum: "$totalSpent" },
      },
    },
  ]);

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        activitySegments,
        roleSegments,
        revenueSegments,
      },
    }),
  );
};

const getUserDetails = async (res: NextApiResponse, userId: string) => {
  if (!userId) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "User ID is required",
      }),
    );
  }

  // Get user basic info
  const userInfo = await User.findById(userId);
  if (!userInfo) {
    return res.status(apiStatusCodes.NOT_FOUND).json(
      sendAPIResponse({
        status: false,
        message: "User not found",
      }),
    );
  }

  // Get user's learning progress
  const [courses, projects, sheets] = await Promise.all([
    UserCourse.find({ userId }).populate("courseId", "name slug coverImageURL"),
    UserProject.find({ userId }).populate(
      "projectId",
      "name slug coverImageURL",
    ),
    UserSheet.find({ userId }).populate("sheetId", "name slug coverImageURL"),
  ]);

  // Get user's payments
  const payments = await Payment.find({ user: userId }).sort({
    createdAt: -1,
  });

  // Get user's gamification data
  const gamificationData = await Gamification.findOne({ userId });

  // Calculate engagement metrics
  const totalEnrollments = courses.length + projects.length + sheets.length;
  const completedCourses = courses.filter((c) => c.isCompleted).length;
  const completedProjects = projects.filter((p) => {
    // Project completion logic - check if all sections are completed
    const totalSections = p.sections?.length || 0;
    const completedSections =
      p.sections?.filter((section) =>
        section.chapters?.every((chapter) => chapter.isCompleted),
      ).length || 0;
    return totalSections > 0 && completedSections === totalSections;
  }).length;
  const completedSheets = sheets.filter((s) => {
    // Sheet completion logic - check if all questions are completed
    const totalQuestions = s.questions?.length || 0;
    const completedQuestions =
      s.questions?.filter((q) => q.isCompleted).length || 0;
    return totalQuestions > 0 && completedQuestions === totalQuestions;
  }).length;
  const totalCompleted = completedCourses + completedProjects + completedSheets;

  const engagementScore =
    totalEnrollments > 0 ? (totalCompleted / totalEnrollments) * 100 : 0;

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        userInfo,
        learningProgress: {
          courses,
          projects,
          sheets,
          totalEnrollments,
          totalCompleted,
          engagementScore: parseFloat(engagementScore.toFixed(2)),
        },
        payments,
        gamificationData,
      },
    }),
  );
};

const getUserActivity = async (
  res: NextApiResponse,
  userId: string,
  dateRange: { start: Date; end: Date },
) => {
  if (!userId) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "User ID is required",
      }),
    );
  }

  const { start, end } = dateRange;

  // Get user's recent activity
  const recentActivity = await Promise.all([
    UserCourse.find({
      userId,
      updatedAt: { $gte: start, $lte: end },
    })
      .populate("courseId", "name")
      .sort({ updatedAt: -1 }),
    UserProject.find({
      userId,
      updatedAt: { $gte: start, $lte: end },
    })
      .populate("projectId", "name")
      .sort({ updatedAt: -1 }),
    UserSheet.find({
      userId,
      updatedAt: { $gte: start, $lte: end },
    })
      .populate("sheetId", "name")
      .sort({ updatedAt: -1 }),
  ]);

  // Get activity timeline
  const activityTimeline = await UserCourse.aggregate([
    {
      $match: {
        userId,
        updatedAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$updatedAt",
            },
          },
        },
        activityCount: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.date": 1 },
    },
  ]);

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        recentActivity: {
          courses: recentActivity[0],
          projects: recentActivity[1],
          sheets: recentActivity[2],
        },
        activityTimeline,
      },
    }),
  );
};

const getCohortAnalysis = async (
  res: NextApiResponse,
  dateRange: { start: Date; end: Date },
) => {
  const { start, end } = dateRange;

  // Cohort analysis by registration month
  const cohortAnalysis = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        userCount: { $sum: 1 },
        onboardedCount: {
          $sum: { $cond: [{ $eq: ["$isOnboarded", true] }, 1, 0] },
        },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
  ]);

  // Retention analysis
  const retentionAnalysis = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $lookup: {
        from: "usercourses",
        localField: "_id",
        foreignField: "userId",
        as: "courses",
      },
    },
    {
      $addFields: {
        hasActivity: { $gt: [{ $size: "$courses" }, 0] },
        daysSinceRegistration: {
          $divide: [
            { $subtract: [new Date(), "$createdAt"] },
            1000 * 60 * 60 * 24,
          ],
        },
      },
    },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              {
                case: { $lte: ["$daysSinceRegistration", 7] },
                then: "Week 1",
              },
              {
                case: { $lte: ["$daysSinceRegistration", 30] },
                then: "Month 1",
              },
              {
                case: { $lte: ["$daysSinceRegistration", 90] },
                then: "Month 3",
              },
              {
                case: { $gt: ["$daysSinceRegistration", 90] },
                then: "3+ Months",
              },
            ],
            default: "Unknown",
          },
        },
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ["$hasActivity", true] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        totalUsers: 1,
        activeUsers: 1,
        retentionRate: {
          $multiply: [{ $divide: ["$activeUsers", "$totalUsers"] }, 100],
        },
      },
    },
  ]);

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        cohortAnalysis,
        retentionAnalysis,
      },
    }),
  );
};

const getRetentionAnalysis = async (
  res: NextApiResponse,
  dateRange: { start: Date; end: Date },
) => {
  const { start, end } = dateRange;

  // User retention by days since registration
  const retentionByDays = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $lookup: {
        from: "usercourses",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$userId", "$$userId"] },
                  { $gte: ["$updatedAt", start] },
                  { $lte: ["$updatedAt", end] },
                ],
              },
            },
          },
        ],
        as: "recentActivity",
      },
    },
    {
      $addFields: {
        daysSinceRegistration: {
          $divide: [
            { $subtract: [new Date(), "$createdAt"] },
            1000 * 60 * 60 * 24,
          ],
        },
        hasRecentActivity: { $gt: [{ $size: "$recentActivity" }, 0] },
      },
    },
    {
      $group: {
        _id: {
          $floor: {
            $divide: ["$daysSinceRegistration", 7],
          },
        },
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: {
            $cond: [{ $eq: ["$hasRecentActivity", true] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        week: { $add: ["$_id", 1] },
        totalUsers: 1,
        activeUsers: 1,
        retentionRate: {
          $multiply: [{ $divide: ["$activeUsers", "$totalUsers"] }, 100],
        },
      },
    },
    {
      $sort: { week: 1 },
    },
  ]);

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        retentionByDays,
      },
    }),
  );
};

const getEngagementScores = async (
  res: NextApiResponse,
  dateRange: { start: Date; end: Date },
) => {
  const { start, end } = dateRange;

  // Calculate engagement scores for users
  const engagementScores = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $lookup: {
        from: "usercourses",
        localField: "_id",
        foreignField: "userId",
        as: "courses",
      },
    },
    {
      $lookup: {
        from: "userprojects",
        localField: "_id",
        foreignField: "userId",
        as: "projects",
      },
    },
    {
      $lookup: {
        from: "usersheets",
        localField: "_id",
        foreignField: "userId",
        as: "sheets",
      },
    },
    {
      $lookup: {
        from: "gamifications",
        localField: "_id",
        foreignField: "userId",
        as: "gamification",
      },
    },
    {
      $addFields: {
        totalEnrollments: {
          $add: [
            { $size: "$courses" },
            { $size: "$projects" },
            { $size: "$sheets" },
          ],
        },
        completedCourses: {
          $size: {
            $filter: {
              input: "$courses",
              cond: { $eq: ["$$this.isCompleted", true] },
            },
          },
        },
        completedProjects: {
          $size: {
            $filter: {
              input: "$projects",
              cond: { $eq: ["$$this.isCompleted", true] },
            },
          },
        },
        totalPoints: {
          $ifNull: [{ $arrayElemAt: ["$gamification.points", 0] }, 0],
        },
      },
    },
    {
      $addFields: {
        completionRate: {
          $cond: [
            { $eq: ["$totalEnrollments", 0] },
            0,
            {
              $multiply: [
                {
                  $divide: [
                    {
                      $add: ["$completedCourses", "$completedProjects"],
                    },
                    "$totalEnrollments",
                  ],
                },
                100,
              ],
            },
          ],
        },
        engagementScore: {
          $add: [
            { $multiply: ["$totalEnrollments", 10] },
            { $multiply: ["$completedCourses", 50] },
            { $multiply: ["$completedProjects", 100] },
            { $multiply: ["$totalPoints", 0.1] },
          ],
        },
      },
    },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              {
                case: { $lt: ["$engagementScore", 100] },
                then: "Low Engagement",
              },
              {
                case: { $lt: ["$engagementScore", 500] },
                then: "Medium Engagement",
              },
              {
                case: { $gte: ["$engagementScore", 500] },
                then: "High Engagement",
              },
            ],
            default: "No Engagement",
          },
        },
        userCount: { $sum: 1 },
        averageScore: { $avg: "$engagementScore" },
        averageCompletionRate: { $avg: "$completionRate" },
      },
    },
  ]);

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        engagementScores,
      },
    }),
  );
};

const getFilteredUsers = async (
  res: NextApiResponse,
  segment: string,
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: number,
  dateRange: { start: Date; end: Date },
) => {
  const { start, end } = dateRange;
  const skip = (page - 1) * limit;

  const matchCriteria: any = {
    createdAt: { $gte: start, $lte: end },
  };

  // Add segment-specific filters
  if (segment === "premium") {
    const premiumUsers = await Payment.distinct("user", { isPaid: true });
    matchCriteria._id = { $in: premiumUsers };
  } else if (segment === "onboarded") {
    matchCriteria.isOnboarded = true;
  } else if (segment === "inactive") {
    // Users with no recent activity
    const activeUsers = await UserCourse.distinct("userId", {
      updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });
    matchCriteria._id = { $nin: activeUsers };
  }

  const sortCriteria: Record<string, 1 | -1> = {
    [sortBy]: sortOrder as 1 | -1,
  };
  const users = await User.find(matchCriteria)
    .sort(sortCriteria)
    .skip(skip)
    .limit(limit)
    .lean();

  const totalUsers = await User.countDocuments(matchCriteria);
  const totalPages = Math.ceil(totalUsers / limit);

  // Enrich user data with additional metrics
  const enrichedUsers = await Promise.all(
    users.map(async (user) => {
      const [courseCount, projectCount, sheetCount, totalPayments] =
        await Promise.all([
          UserCourse.countDocuments({ userId: user._id }),
          UserProject.countDocuments({ userId: user._id }),
          UserSheet.countDocuments({ userId: user._id }),
          Payment.aggregate([
            { $match: { user: user._id, isPaid: true } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]),
        ]);

      return {
        ...user,
        metrics: {
          totalEnrollments: courseCount + projectCount + sheetCount,
          totalSpent: totalPayments[0]?.total || 0,
        },
      };
    }),
  );

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        users: enrichedUsers,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    }),
  );
};

const getUserGrowthAnalysis = async (
  res: NextApiResponse,
  dateRange: { start: Date; end: Date },
) => {
  const { start, end } = dateRange;

  // Daily user growth
  const dailyGrowth = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
        },
        newUsers: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.date": 1 },
    },
  ]);

  // Growth by source (if you have provider data)
  const growthBySource = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: "$provider",
        userCount: { $sum: 1 },
      },
    },
  ]);

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        dailyGrowth,
        growthBySource,
      },
    }),
  );
};

const getUserDemographics = async (
  res: NextApiResponse,
  dateRange: { start: Date; end: Date },
) => {
  const { start, end } = dateRange;

  // Demographics by role
  const roleDistribution = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: "$occupation",
        count: { $sum: 1 },
      },
    },
  ]);

  // Purpose distribution
  const purposeDistribution = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $unwind: "$purpose",
    },
    {
      $group: {
        _id: "$purpose",
        count: { $sum: 1 },
      },
    },
  ]);

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        roleDistribution,
        purposeDistribution,
      },
    }),
  );
};

export default withApiHandler(handler);
