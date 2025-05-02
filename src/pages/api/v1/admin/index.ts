import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/middlewares';
import { apiStatusCodes } from '@/constant';
import { sendAPIResponse } from '@/utils';
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
  await connectDB();
  const { method, query } = req;
  const { type = 'overview', page = '1', limit = '20' } = query;

  switch (method) {
    case 'GET':
      return handleAdminDashboard(
        req,
        res,
        type as string,
        parseInt(page as string),
        parseInt(limit as string)
      );
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${method} not allowed`,
        })
      );
  }
};

const handleAdminDashboard = async (
  req: NextApiRequest,
  res: NextApiResponse,
  type: string,
  page: number,
  limit: number
) => {
  try {
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

      case 'users': {
        const { data, error } = await getAllDocumentsFromModel(
          User,
          page,
          limit
        );
        if (error) {
          return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({
              status: false,
              error,
              message: 'Failed to fetch users',
            })
          );
        }
        return res
          .status(apiStatusCodes.OKAY)
          .json(sendAPIResponse({ status: true, data }));
      }

      case 'user-courses': {
        const { data, error } = await getAllDocumentsFromModel(
          UserCourse,
          page,
          limit,
          {
            path: 'courseId',
            select: 'name slug coverImageURL',
          }
        );
        if (error) {
          return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({
              status: false,
              error,
              message: 'Failed to fetch user courses',
            })
          );
        }
        return res
          .status(apiStatusCodes.OKAY)
          .json(sendAPIResponse({ status: true, data }));
      }

      case 'user-projects': {
        const { data, error } = await getAllDocumentsFromModel(
          UserProject,
          page,
          limit,
          {
            path: 'projectId',
            select: 'name slug coverImageURL roadmap difficultyLevel',
          }
        );
        if (error) {
          return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({
              status: false,
              error,
              message: 'Failed to fetch user projects',
            })
          );
        }
        return res
          .status(apiStatusCodes.OKAY)
          .json(sendAPIResponse({ status: true, data }));
      }

      case 'user-sheets': {
        const { data, error } = await getAllDocumentsFromModel(
          UserSheet,
          page,
          limit,
          {
            path: 'sheetId',
            select: 'title slug coverImageURL roadmap difficultyLevel',
          }
        );
        if (error) {
          return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
            sendAPIResponse({
              status: false,
              error,
              message: 'Failed to fetch user sheets',
            })
          );
        }
        return res
          .status(apiStatusCodes.OKAY)
          .json(sendAPIResponse({ status: true, data }));
      }

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
