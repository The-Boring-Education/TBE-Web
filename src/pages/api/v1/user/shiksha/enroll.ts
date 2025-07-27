import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import { enrollInACourse, getEnrolledCourseFromDB, getUserByIdFromDB, getACourseFromDBById } from '@/database';
import type { CourseEnrollmentRequestProps } from '@/interfaces';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';
import { sendCourseEnrollmentEmail } from '@/utils/email';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();

    switch (req.method) {
      case 'POST':
        return handleCourseEnrollment(req, res);
      default:
        return res.status(apiStatusCodes.BAD_REQUEST).json(
          sendAPIResponse({
            status: false,
            message: `Method ${req.method} Not Allowed`,
          })
        );
    }
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: `Something went wrong`,
        error,
      })
    );
  }
};

const handleCourseEnrollment = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { userId, courseId } = req.body as CourseEnrollmentRequestProps;

  try {
    const { data: alreadyExists, error: fetchEnrolledCourseError } =
      await getEnrolledCourseFromDB({ courseId, userId });

    if (fetchEnrolledCourseError)
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed while enrolling course',
        })
      );
    if (alreadyExists)
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Already enrolled in course',
        })
      );

    const { data, error } = await enrollInACourse({ userId, courseId });

    if (error)
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed while enrolling course',
        })
      );

    // Send course enrollment email (non-blocking)
    try {
      const [userResult, courseResult] = await Promise.all([
        getUserByIdFromDB(userId),
        getACourseFromDBById(courseId)
      ]);

      if (userResult.data && courseResult.data) {
        sendCourseEnrollmentEmail({
          userEmail: userResult.data.email,
          userName: userResult.data.name,
          userId: userId,
          courseName: courseResult.data.title,
          courseDescription: courseResult.data.description,
          courseId: courseId,
        }).catch(error => {
          console.error('Failed to send course enrollment email:', error);
          // Don't fail the enrollment if email fails
        });
      }
    } catch (error) {
      console.error('Error fetching user/course data for email:', error);
      // Don't fail the enrollment if email data fetch fails
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: 'Successfully enrolled in course',
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed while enrolling course',
        error,
      })
    );
  }
};

export default handler;
