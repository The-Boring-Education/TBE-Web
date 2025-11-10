import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/lib/constants';
import {
  getAllEnrolledCoursesFromDB,
  getAllEnrolledProjectsFromDB,
  getAllEnrolledSheetsFromDB,
  getUserByIdFromDB,
  getUserPlaylistsFromDB,
} from '@/lib/database';
import { sendAPIResponse } from '@/lib/utils';
import { cors } from '@/lib/utils';
import { connectDB } from '@/middleware';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Apply CORS headers
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await connectDB();

  const { method, query } = req;
  const { userId } = query;

  switch (method) {
    case 'GET':
      return handleGetUserDashboard(req, res, userId as string);
  }
};

const handleGetUserDashboard = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  try {
    if (userId) {
      const { error } = await getUserByIdFromDB(userId);

      if (error) {
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
          sendAPIResponse({
            status: false,
            error,
            message: 'Error while fetching user',
          })
        );
      }

      // Fetch User Dashboard
      let enrolledCourses = [];
      let enrolledProjects = [];
      let enrolledSheets = [];
      let enrolledPlaylists = [];

      // 1. Shiksha
      const { data: allCourses } = await getAllEnrolledCoursesFromDB(userId);
      if (allCourses) enrolledCourses = allCourses;

      // 2. Projects
      const { data: allProjects } = await getAllEnrolledProjectsFromDB(userId);
      if (allProjects) enrolledProjects = allProjects;

      // 3. Interview Sheets
      const { data: allUserSheets } = await getAllEnrolledSheetsFromDB(userId);
      if (allUserSheets) enrolledSheets = allUserSheets;

      // 4. Playlists
      const { data: allPlaylists } = await getUserPlaylistsFromDB(userId);
      if (allPlaylists) enrolledPlaylists = allPlaylists;

      const userDashboard = {
        enrolledCourses,
        enrolledProjects,
        enrolledSheets,
        enrolledPlaylists,
      };

      return res
        .status(apiStatusCodes.OKAY)
        .json(sendAPIResponse({ status: true, data: userDashboard }));
    }

    if (userId) {
      const { data, error } = await getUserByIdFromDB(userId);

      if (error) {
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
          sendAPIResponse({
            status: false,
            error,
            message: 'Error while fetching user',
          })
        );
      }

      return res
        .status(apiStatusCodes.OKAY)
        .json(sendAPIResponse({ status: true, data }));
    }

    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: 'Please provide Email or User id',
        error: 'Please provide Email or User id',
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        error,
        message: 'error while fetching user',
      })
    );
  }
};

export default handler;
