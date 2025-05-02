import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/middlewares';
import { apiStatusCodes, envConfig } from '@/constant';
import { applyCorsHeaders, sendAPIResponse } from '@/utils';
import {
  User,
  UserCourse,
  UserProject,
  UserSheet,
  Course,
  Project,
  InterviewSheet,
  getTotalCountFromModel,
  getAllDocumentsFromModel,
} from '@/database';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  applyCorsHeaders(res, envConfig.ADMIN_BASE_URL);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await connectDB();

  const { method, query } = req;
  const { type = 'overview', page = '1', limit = '20' } = query;

  if (method !== 'GET') {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: `Method ${method} not allowed`,
      })
    );
  }

  return handleAdminDashboard(
    res,
    type as string,
    parseInt(page as string),
    parseInt(limit as string)
  );
};

const handleAdminDashboard = async (
  res: NextApiResponse,
  type: string,
  page: number,
  limit: number
) => {
  try {
    const fetchAndRespond = async (
      model: any,
      populateOptions?: any,
      errorMessage?: string
    ) => {
      const { data, error } = await getAllDocumentsFromModel(
        model,
        page,
        limit,
        populateOptions
      );

      if (error) {
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
          sendAPIResponse({
            status: false,
            error,
            message: errorMessage || 'Failed to fetch data',
          })
        );
      }

      return res
        .status(apiStatusCodes.OKAY)
        .json(sendAPIResponse({ status: true, data }));
    };

    switch (type) {
      case 'overview': {
        const [
          totalUsers,
          totalCourses,
          coursesEnrolled,
          totalProjects,
          projectsEnrolled,
          totalSheets,
          sheetsEnrolled,
        ] = await Promise.all([
          getTotalCountFromModel(User),
          getTotalCountFromModel(Course),
          getTotalCountFromModel(UserCourse),
          getTotalCountFromModel(Project),
          getTotalCountFromModel(UserProject),
          getTotalCountFromModel(InterviewSheet),
          getTotalCountFromModel(UserSheet),
        ]);

        return res.status(apiStatusCodes.OKAY).json(
          sendAPIResponse({
            status: true,
            data: {
              totalUsers: totalUsers.data || 0,
              totalCourses: totalCourses.data || 0,
              coursesEnrolled: coursesEnrolled.data || 0,
              totalProjects: totalProjects.data || 0,
              projectsEnrolled: projectsEnrolled.data || 0,
              totalSheets: totalSheets.data || 0,
              sheetsEnrolled: sheetsEnrolled.data || 0,
            },
          })
        );
      }

      case 'users':
        return fetchAndRespond(User, null, 'Failed to fetch users');

      case 'user-courses':
        return fetchAndRespond(
          UserCourse,
          { path: 'courseId', select: 'name slug coverImageURL' },
          'Failed to fetch user courses'
        );

      case 'user-projects':
        return fetchAndRespond(
          UserProject,
          {
            path: 'projectId',
            select: 'name slug coverImageURL roadmap difficultyLevel',
          },
          'Failed to fetch user projects'
        );

      case 'user-sheets':
        return fetchAndRespond(
          UserSheet,
          {
            path: 'sheetId',
            select: 'title slug coverImageURL roadmap difficultyLevel',
          },
          'Failed to fetch user sheets'
        );

      default:
        return res.status(apiStatusCodes.BAD_REQUEST).json(
          sendAPIResponse({
            status: false,
            message: 'Invalid admin dashboard type',
          })
        );
    }
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        error,
        message: 'Unexpected error in admin dashboard API',
      })
    );
  }
};

export default handler;
