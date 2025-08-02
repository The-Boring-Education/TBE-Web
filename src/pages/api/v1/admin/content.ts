import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes, envConfig } from '@/constant';
import {
  Course,
  Feedback,
  InterviewSheet,
  Project,
  UserCourse,
  UserProject,
  UserSheet,
  Webinar,
} from '@/database';
import { connectDB } from '@/middlewares';
import { applyCorsHeaders, sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  applyCorsHeaders(res, req);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await connectDB();

  const { method, query } = req;
  const {
    action,
    contentType,
    contentId,
    startDate,
    endDate,
    page = '1',
    limit = '20',
    sortBy = 'createdAt',
    order = 'desc',
  } = query;

  if (method !== 'GET') {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: `Method ${method} not allowed`,
      })
    );
  }

  return handleContentManagementRequest(
    res,
    action as string,
    contentType as string,
    contentId as string,
    startDate as string,
    endDate as string,
    parseInt(page as string),
    parseInt(limit as string),
    sortBy as string,
    order as string
  );
};

const handleContentManagementRequest = async (
  res: NextApiResponse,
  action: string,
  contentType: string,
  contentId: string,
  startDate: string,
  endDate: string,
  page: number,
  limit: number,
  sortBy: string,
  order: string
) => {
  try {
    const dateRange = getDateRange(startDate, endDate);
    const sortOrder = order === 'desc' ? -1 : 1;

    switch (action) {
      case 'performance':
        return await getContentPerformance(res, contentType, dateRange);
      case 'details':
        return await getContentDetails(res, contentType, contentId, dateRange);
      case 'engagement':
        return await getContentEngagement(res, contentType, dateRange);
      case 'difficulty-analysis':
        return await getDifficultyAnalysis(res, dateRange);
      case 'completion-funnel':
        return await getCompletionFunnel(
          res,
          contentType,
          contentId,
          dateRange
        );
      case 'feedback-analysis':
        return await getFeedbackAnalysis(res, contentType, dateRange);
      case 'trending':
        return await getTrendingContent(res, dateRange);
      case 'optimization-insights':
        return await getOptimizationInsights(res, dateRange);
      case 'content-gaps':
        return await getContentGaps(res, dateRange);
      case 'list':
        return await getContentList(
          res,
          contentType,
          page,
          limit,
          sortBy,
          sortOrder,
          dateRange
        );
      default:
        return res.status(apiStatusCodes.BAD_REQUEST).json(
          sendAPIResponse({
            status: false,
            message: 'Invalid action specified',
          })
        );
    }
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        error,
        message: 'Error processing content management request',
      })
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

const getContentPerformance = async (
  res: NextApiResponse,
  contentType: string,
  dateRange: { start: Date; end: Date }
) => {
  const { start, end } = dateRange;

  let performanceData;

  switch (contentType) {
    case 'courses':
      performanceData = await UserCourse.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: '$courseId',
            enrollments: { $sum: 1 },
            completions: {
              $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] },
            },
            avgChaptersCompleted: {
              $avg: {
                $size: {
                  $filter: {
                    input: '$chapters',
                    cond: { $eq: ['$$this.isCompleted', true] },
                  },
                },
              },
            },
            certificatesIssued: {
              $sum: { $cond: [{ $ne: ['$certificateId', null] }, 1, 0] },
            },
          },
        },
        {
          $lookup: {
            from: 'courses',
            localField: '_id',
            foreignField: '_id',
            as: 'courseInfo',
          },
        },
        {
          $unwind: '$courseInfo',
        },
        {
          $addFields: {
            completionRate: {
              $multiply: [{ $divide: ['$completions', '$enrollments'] }, 100],
            },
            certificateRate: {
              $multiply: [
                { $divide: ['$certificatesIssued', '$enrollments'] },
                100,
              ],
            },
          },
        },
        {
          $project: {
            courseName: '$courseInfo.name',
            courseSlug: '$courseInfo.slug',
            difficulty: '$courseInfo.difficultyLevel',
            roadmap: '$courseInfo.roadmap',
            isPremium: '$courseInfo.isPremium',
            price: '$courseInfo.price',
            enrollments: 1,
            completions: 1,
            completionRate: 1,
            certificatesIssued: 1,
            certificateRate: 1,
            avgChaptersCompleted: 1,
            totalChapters: { $size: '$courseInfo.chapters' },
          },
        },
        {
          $sort: { enrollments: -1 },
        },
      ]);
      break;

    case 'projects':
      performanceData = await UserProject.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: '$projectId',
            enrollments: { $sum: 1 },
            avgSectionsCompleted: {
              $avg: {
                $size: {
                  $filter: {
                    input: '$sections',
                    cond: {
                      $allElementsTrue: {
                        $map: {
                          input: '$$this.chapters',
                          as: 'chapter',
                          in: '$$chapter.isCompleted',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: 'projects',
            localField: '_id',
            foreignField: '_id',
            as: 'projectInfo',
          },
        },
        {
          $unwind: '$projectInfo',
        },
        {
          $project: {
            projectName: '$projectInfo.name',
            projectSlug: '$projectInfo.slug',
            difficulty: '$projectInfo.difficultyLevel',
            roadmap: '$projectInfo.roadmap',
            isPremium: '$projectInfo.isPremium',
            price: '$projectInfo.price',
            enrollments: 1,
            avgSectionsCompleted: 1,
            totalSections: { $size: '$projectInfo.sections' },
          },
        },
        {
          $sort: { enrollments: -1 },
        },
      ]);
      break;

    case 'sheets':
      performanceData = await UserSheet.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: '$sheetId',
            enrollments: { $sum: 1 },
            avgQuestionsCompleted: {
              $avg: {
                $size: {
                  $filter: {
                    input: '$questions',
                    cond: { $eq: ['$$this.isCompleted', true] },
                  },
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: 'interviewsheets',
            localField: '_id',
            foreignField: '_id',
            as: 'sheetInfo',
          },
        },
        {
          $unwind: '$sheetInfo',
        },
        {
          $project: {
            sheetName: '$sheetInfo.name',
            sheetSlug: '$sheetInfo.slug',
            roadmap: '$sheetInfo.roadmap',
            isPremium: '$sheetInfo.isPremium',
            price: '$sheetInfo.price',
            enrollments: 1,
            avgQuestionsCompleted: 1,
            totalQuestions: { $size: '$sheetInfo.questions' },
          },
        },
        {
          $sort: { enrollments: -1 },
        },
      ]);
      break;

    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Invalid content type specified',
        })
      );
  }

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: performanceData,
    })
  );
};

const getContentDetails = async (
  res: NextApiResponse,
  contentType: string,
  contentId: string,
  dateRange: { start: Date; end: Date }
) => {
  if (!contentId) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: 'Content ID is required',
      })
    );
  }

  const { start, end } = dateRange;

  let contentDetails;
  let engagementMetrics;
  let feedbackData;

  switch (contentType) {
    case 'courses':
      contentDetails = await Course.findById(contentId);
      engagementMetrics = await UserCourse.aggregate([
        {
          $match: {
            courseId: contentId,
            updatedAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            totalEnrollments: { $sum: 1 },
            completions: {
              $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] },
            },
            certificatesIssued: {
              $sum: { $cond: [{ $ne: ['$certificateId', null] }, 1, 0] },
            },
          },
        },
      ]);

      {
        // Chapter-wise engagement
        const chapterEngagement = await UserCourse.aggregate([
          {
            $match: {
              courseId: contentId,
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
                $sum: {
                  $cond: [{ $eq: ['$chapters.isCompleted', true] }, 1, 0],
                },
              },
            },
          },
          {
            $addFields: {
              completionRate: {
                $multiply: [{ $divide: ['$completions', '$totalViews'] }, 100],
              },
            },
          },
          {
            $sort: { completionRate: -1 },
          },
        ]);

        feedbackData = await Feedback.find({
          type: 'SHIKSHA_COURSE',
          ref: contentId,
          createdAt: { $gte: start, $lte: end },
        });

        return res.status(apiStatusCodes.OKAY).json(
          sendAPIResponse({
            status: true,
            data: {
              contentDetails,
              engagementMetrics: engagementMetrics[0] || {},
              chapterEngagement,
              feedbackData,
              averageRating:
                feedbackData.length > 0
                  ? feedbackData.reduce((sum, f) => sum + f.rating, 0) /
                    feedbackData.length
                  : 0,
            },
          })
        );
      }

    case 'projects':
      contentDetails = await Project.findById(contentId);
      engagementMetrics = await UserProject.aggregate([
        {
          $match: {
            projectId: contentId,
            updatedAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            totalEnrollments: { $sum: 1 },
          },
        },
      ]);

      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          data: {
            contentDetails,
            engagementMetrics: engagementMetrics[0] || {},
          },
        })
      );

    case 'sheets':
      contentDetails = await InterviewSheet.findById(contentId);
      engagementMetrics = await UserSheet.aggregate([
        {
          $match: {
            sheetId: contentId,
            updatedAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            totalEnrollments: { $sum: 1 },
          },
        },
      ]);

      feedbackData = await Feedback.find({
        type: 'INTERVIEW_SHEET',
        ref: contentId,
        createdAt: { $gte: start, $lte: end },
      });

      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          data: {
            contentDetails,
            engagementMetrics: engagementMetrics[0] || {},
            feedbackData,
            averageRating:
              feedbackData.length > 0
                ? feedbackData.reduce((sum, f) => sum + f.rating, 0) /
                  feedbackData.length
                : 0,
          },
        })
      );

    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Invalid content type specified',
        })
      );
  }
};

const getContentEngagement = async (
  res: NextApiResponse,
  contentType: string,
  dateRange: { start: Date; end: Date }
) => {
  const { start, end } = dateRange;

  // Engagement patterns by time
  const engagementByTime = await UserCourse.aggregate([
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
    {
      $sort: { '_id.hour': 1, '_id.dayOfWeek': 1 },
    },
  ]);

  // Engagement by user demographics
  const engagementByDemographics = await UserCourse.aggregate([
    {
      $match: {
        updatedAt: { $gte: start, $lte: end },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $group: {
        _id: '$user.occupation',
        totalEngagement: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
      },
    },
    {
      $addFields: {
        uniqueUserCount: { $size: '$uniqueUsers' },
      },
    },
  ]);

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        engagementByTime,
        engagementByDemographics,
      },
    })
  );
};

const getDifficultyAnalysis = async (
  res: NextApiResponse,
  dateRange: { start: Date; end: Date }
) => {
  const { start, end } = dateRange;

  // Difficulty analysis for courses
  const coursesDifficultyAnalysis = await UserCourse.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'courseId',
        foreignField: '_id',
        as: 'course',
      },
    },
    {
      $unwind: '$course',
    },
    {
      $group: {
        _id: '$course.difficultyLevel',
        totalEnrollments: { $sum: 1 },
        completions: {
          $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] },
        },
        avgChaptersCompleted: {
          $avg: {
            $size: {
              $filter: {
                input: '$chapters',
                cond: { $eq: ['$$this.isCompleted', true] },
              },
            },
          },
        },
      },
    },
    {
      $addFields: {
        completionRate: {
          $multiply: [{ $divide: ['$completions', '$totalEnrollments'] }, 100],
        },
      },
    },
  ]);

  // Roadmap analysis
  const roadmapAnalysis = await UserCourse.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'courseId',
        foreignField: '_id',
        as: 'course',
      },
    },
    {
      $unwind: '$course',
    },
    {
      $group: {
        _id: '$course.roadmap',
        totalEnrollments: { $sum: 1 },
        completions: {
          $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] },
        },
      },
    },
    {
      $addFields: {
        completionRate: {
          $multiply: [{ $divide: ['$completions', '$totalEnrollments'] }, 100],
        },
      },
    },
  ]);

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        coursesDifficultyAnalysis,
        roadmapAnalysis,
      },
    })
  );
};

const getCompletionFunnel = async (
  res: NextApiResponse,
  contentType: string,
  contentId: string,
  dateRange: { start: Date; end: Date }
) => {
  if (!contentId) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: 'Content ID is required for funnel analysis',
      })
    );
  }

  const { start, end } = dateRange;

  if (contentType === 'courses') {
    const funnelData = await UserCourse.aggregate([
      {
        $match: {
          courseId: contentId,
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $unwind: '$chapters',
      },
      {
        $group: {
          _id: '$chapters.chapterId',
          started: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$chapters.isCompleted', true] }, 1, 0] },
          },
        },
      },
      {
        $addFields: {
          completionRate: {
            $multiply: [{ $divide: ['$completed', '$started'] }, 100],
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: {
          funnelData,
        },
      })
    );
  }

  return res.status(apiStatusCodes.BAD_REQUEST).json(
    sendAPIResponse({
      status: false,
      message: 'Funnel analysis not implemented for this content type',
    })
  );
};

const getFeedbackAnalysis = async (
  res: NextApiResponse,
  contentType: string,
  dateRange: { start: Date; end: Date }
) => {
  const { start, end } = dateRange;

  let feedbackType;
  switch (contentType) {
    case 'courses':
      feedbackType = 'SHIKSHA_COURSE';
      break;
    case 'sheets':
      feedbackType = 'INTERVIEW_SHEET';
      break;
    default:
      feedbackType = 'GENERAL';
  }

  const feedbackAnalysis = await Feedback.aggregate([
    {
      $match: {
        type: feedbackType,
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
        feedbacks: { $push: '$feedback' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const averageRating = await Feedback.aggregate([
    {
      $match: {
        type: feedbackType,
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalFeedback: { $sum: 1 },
      },
    },
  ]);

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        feedbackAnalysis,
        averageRating: averageRating[0]?.averageRating || 0,
        totalFeedback: averageRating[0]?.totalFeedback || 0,
      },
    })
  );
};

const getTrendingContent = async (
  res: NextApiResponse,
  dateRange: { start: Date; end: Date }
) => {
  const { start, end } = dateRange;

  const trendingCourses = await UserCourse.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: '$courseId',
        enrollments: { $sum: 1 },
        recentActivity: {
          $sum: {
            $cond: [
              {
                $gte: [
                  '$updatedAt',
                  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                ],
              },
              1,
              0,
            ],
          },
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
      $addFields: {
        trendingScore: {
          $add: [
            { $multiply: ['$enrollments', 1] },
            { $multiply: ['$recentActivity', 3] },
          ],
        },
      },
    },
    {
      $sort: { trendingScore: -1 },
    },
    {
      $limit: 10,
    },
  ]);

  const trendingSheets = await UserSheet.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: '$sheetId',
        enrollments: { $sum: 1 },
        recentActivity: {
          $sum: {
            $cond: [
              {
                $gte: [
                  '$updatedAt',
                  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: 'interviewsheets',
        localField: '_id',
        foreignField: '_id',
        as: 'sheet',
      },
    },
    {
      $unwind: '$sheet',
    },
    {
      $addFields: {
        trendingScore: {
          $add: [
            { $multiply: ['$enrollments', 1] },
            { $multiply: ['$recentActivity', 3] },
          ],
        },
      },
    },
    {
      $sort: { trendingScore: -1 },
    },
    {
      $limit: 10,
    },
  ]);

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        trendingCourses,
        trendingSheets,
      },
    })
  );
};

const getOptimizationInsights = async (
  res: NextApiResponse,
  dateRange: { start: Date; end: Date }
) => {
  const { start, end } = dateRange;

  // Low performing content
  const lowPerformingCourses = await UserCourse.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: '$courseId',
        enrollments: { $sum: 1 },
        completions: {
          $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] },
        },
      },
    },
    {
      $addFields: {
        completionRate: {
          $divide: ['$completions', '$enrollments'],
        },
      },
    },
    {
      $match: {
        enrollments: { $gte: 10 }, // Only consider courses with decent enrollment
        completionRate: { $lt: 0.3 }, // Less than 30% completion rate
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
        enrollments: 1,
        completions: 1,
        completionRate: { $multiply: ['$completionRate', 100] },
      },
    },
  ]);

  // High drop-off chapters
  const highDropOffChapters = await UserCourse.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $unwind: '$chapters',
    },
    {
      $group: {
        _id: '$chapters.chapterId',
        started: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$chapters.isCompleted', true] }, 1, 0] },
        },
      },
    },
    {
      $addFields: {
        dropOffRate: {
          $multiply: [
            { $subtract: [1, { $divide: ['$completed', '$started'] }] },
            100,
          ],
        },
      },
    },
    {
      $match: {
        started: { $gte: 10 },
        dropOffRate: { $gt: 70 },
      },
    },
    {
      $sort: { dropOffRate: -1 },
    },
  ]);

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        lowPerformingCourses,
        highDropOffChapters,
      },
    })
  );
};

const getContentGaps = async (
  res: NextApiResponse,
  dateRange: { start: Date; end: Date }
) => {
  const { start, end } = dateRange;

  // Popular roadmaps with few courses
  const roadmapGaps = await UserCourse.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'courseId',
        foreignField: '_id',
        as: 'course',
      },
    },
    {
      $unwind: '$course',
    },
    {
      $group: {
        _id: '$course.roadmap',
        totalEnrollments: { $sum: 1 },
        uniqueCourses: { $addToSet: '$courseId' },
      },
    },
    {
      $addFields: {
        courseCount: { $size: '$uniqueCourses' },
        demandPerCourse: { $divide: ['$totalEnrollments', '$courseCount'] },
      },
    },
    {
      $match: {
        demandPerCourse: { $gt: 50 }, // High demand per course
        courseCount: { $lt: 5 }, // Few courses available
      },
    },
    {
      $sort: { demandPerCourse: -1 },
    },
  ]);

  // Difficulty level gaps
  const difficultyGaps = await Course.aggregate([
    {
      $group: {
        _id: '$difficultyLevel',
        courseCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'usercourses',
        pipeline: [
          {
            $match: {
              createdAt: { $gte: start, $lte: end },
            },
          },
          {
            $lookup: {
              from: 'courses',
              localField: 'courseId',
              foreignField: '_id',
              as: 'course',
            },
          },
          {
            $unwind: '$course',
          },
          {
            $group: {
              _id: '$course.difficultyLevel',
              totalEnrollments: { $sum: 1 },
            },
          },
        ],
        as: 'enrollmentData',
      },
    },
    {
      $addFields: {
        totalEnrollments: {
          $ifNull: [
            { $arrayElemAt: ['$enrollmentData.totalEnrollments', 0] },
            0,
          ],
        },
        demandPerCourse: {
          $divide: [
            {
              $ifNull: [
                { $arrayElemAt: ['$enrollmentData.totalEnrollments', 0] },
                0,
              ],
            },
            '$courseCount',
          ],
        },
      },
    },
  ]);

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        roadmapGaps,
        difficultyGaps,
      },
    })
  );
};

const getContentList = async (
  res: NextApiResponse,
  contentType: string,
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: number,
  dateRange: { start: Date; end: Date }
) => {
  const { start, end } = dateRange;
  const skip = (page - 1) * limit;

  const matchCriteria = {
    createdAt: { $gte: start, $lte: end },
  };

  const sortCriteria: Record<string, 1 | -1> = {
    [sortBy]: sortOrder as 1 | -1,
  };

  let content: any;
  let totalContent: number;

  switch (contentType) {
    case 'courses':
      content = await Course.find(matchCriteria)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean();
      totalContent = await Course.countDocuments(matchCriteria);
      break;
    case 'projects':
      content = await Project.find(matchCriteria)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean();
      totalContent = await Project.countDocuments(matchCriteria);
      break;
    case 'sheets':
      content = await InterviewSheet.find(matchCriteria)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean();
      totalContent = await InterviewSheet.countDocuments(matchCriteria);
      break;
    case 'webinars':
      content = await Webinar.find(matchCriteria)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean();
      totalContent = await Webinar.countDocuments(matchCriteria);
      break;
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Invalid content type specified',
        })
      );
  }

  const totalPages = Math.ceil(totalContent / limit);

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        content,
        pagination: {
          currentPage: page,
          totalPages,
          totalContent,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    })
  );
};

export default handler;
