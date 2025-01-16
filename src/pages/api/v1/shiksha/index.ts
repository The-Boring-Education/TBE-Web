import { apiStatusCodes } from '@/constant';
import { NextApiRequest, NextApiResponse } from 'next';
import { sendAPIResponse } from '@/utils';
import { connectDB } from '@/middlewares';
import {
  addACourseToDB,
  getAllCourseFromDB,
  getAllEnrolledCoursesFromDB,
  getCourseBySlugFromDB,
} from '@/database';
import {
  AddCourseRequestPayloadProps,
  BaseShikshaCourseResponseProps,
} from '@/interfaces';
import mongoose from 'mongoose';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  const { method, query } = req;
  const { userId } = query as { userId: string };

  switch (method) {
    case 'POST':
      return handleAddACourse(req, res);
    case 'GET':
      return handleAllGetCourse(req, res, userId);
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
        error: error,
      })
    );
  }
};

const handleAllGetCourse = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  try {
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
        message: 'Failed while fetching courses',
        error,
      })
    );
  }
};

export default handler;
