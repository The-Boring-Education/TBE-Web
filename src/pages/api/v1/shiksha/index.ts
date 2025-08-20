import type mongoose from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import {
  addACourseToDB,
  getAllCourseFromDB,
  getAllEnrolledCoursesFromDB,
  getCourseBySlugFromDB,
  getCourseBySlugWithUserFromDB,
} from '@/database';
import type {
  AddCourseRequestPayloadProps,
  BaseShikshaCourseResponseProps,
} from '@/interfaces';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';
import { cors } from '@/utils/cors';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Apply CORS headers
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await connectDB();
  const { method, query } = req;
  const { userId, slug } = query as { userId: string; slug: string };

  switch (method) {
    case 'POST':
      return handleAddACourse(req, res);
    case 'GET':
      return handleAllGetCourse(req, res, userId, slug);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};

const handleAddACourse = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const coursePayload = req.body as AddCourseRequestPayloadProps;

    const { error: courseAlreadyExist } = await getCourseBySlugFromDB(
      coursePayload.slug
    );

    if (!courseAlreadyExist) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Course already exists',
        })
      );
    }

    const { data, error } = await addACourseToDB(coursePayload);

    if (error)
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Course not added',
          error,
        })
      );

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: 'Course added successfully',
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed while adding course',
        error,
      })
    );
  }
};

const handleAllGetCourse = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
  slug?: string
) => {
  try {
    // If slug is provided, fetch specific course by slug with user data
    if (slug) {
      const { data: course, error } = await getCourseBySlugWithUserFromDB(slug, userId);

      if (error || !course) {
        return res.status(apiStatusCodes.NOT_FOUND).json(
          sendAPIResponse({
            status: false,
            message: 'Course not found',
            error,
          })
        );
      }

      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          data: course,
        })
      );
    }

    // No slug? Return all courses (existing logic)
    let allCoursesResponse: BaseShikshaCourseResponseProps[] = [];

    // Fetch all courses
    const { data: allCourses, error: allCoursesError } =
      await getAllCourseFromDB();

    if (allCoursesError || !allCourses) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed while fetching courses',
          error: allCoursesError,
        })
      );
    }

    // Create a map of all courses by their ID
    const courseMap = new Map<string, BaseShikshaCourseResponseProps>(
      allCourses.map((course: BaseShikshaCourseResponseProps) => {
        const courseDoc = course as mongoose.Document &
          BaseShikshaCourseResponseProps;
        return [courseDoc._id.toString(), { ...courseDoc.toObject() }];
      })
    );

    // If the user is logged in, fetch enrolled courses and mark them in the map
    if (userId) {
      const { data: enrolledCourses, error: enrolledCoursesError } =
        await getAllEnrolledCoursesFromDB(userId);

      if (enrolledCoursesError) {
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
          sendAPIResponse({
            status: false,
            message: 'Failed while fetching enrolled courses',
            error: enrolledCoursesError,
          })
        );
      }

      // Update the map to mark enrolled courses
      enrolledCourses.forEach(
        (enrolledCourse: BaseShikshaCourseResponseProps) => {
          const courseId = enrolledCourse._id.toString();
          if (courseMap.has(courseId)) {
            courseMap.set(courseId, {
              ...courseMap.get(courseId),
              isEnrolled: true,
              _id: courseId,
            });
          }
        }
      );
    }

    // Convert the map back to an array to prepare the final response
    allCoursesResponse = Array.from(courseMap.values());

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: allCoursesResponse,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Unexpected error while fetching courses',
        error,
      })
    );
  }
};

export default handler;
