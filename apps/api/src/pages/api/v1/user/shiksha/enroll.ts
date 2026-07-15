import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  enrollInACourse,
  getACourseFromDBById,
  getEnrolledCourseFromDB,
  getUserByIdFromDB,
} from "@/lib/database";
import type { CourseEnrollmentRequestProps } from "@/lib/interfaces";
import { sendCourseEnrollmentEmail } from "@/lib/services";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withApiHandler } from "@/middleware/requestLogger";
import { getAuthenticatedUserId, verifyOwnership } from "@/middleware/userAuth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "POST":
        return handleCourseEnrollment(req, res);
      default:
        return res.status(apiStatusCodes.BAD_REQUEST).json(
          sendAPIResponse({
            status: false,
            message: `Method ${req.method} Not Allowed`,
          }),
        );
    }
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: `Something went wrong`,
        error,
      }),
    );
  }
};

const handleCourseEnrollment = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const authenticatedUserId = getAuthenticatedUserId(req, res);
  if (!authenticatedUserId) return;

  const { userId, courseId } = (req.body || {}) as CourseEnrollmentRequestProps;

  if (!userId || !courseId) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "userId and courseId are required",
        error: "MISSING_FIELDS",
      }),
    );
  }

  if (!verifyOwnership(authenticatedUserId, userId, res)) return;

  try {
    const { data: alreadyExists, error: fetchEnrolledCourseError } =
      await getEnrolledCourseFromDB({ courseId, userId });

    if (fetchEnrolledCourseError)
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed while enrolling course",
        }),
      );
    if (alreadyExists)
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Already enrolled in course",
        }),
      );

    const { data, error } = await enrollInACourse({ userId, courseId });

    if (error)
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed while enrolling course",
        }),
      );

    // Send course enrollment email (non-blocking)
    try {
      const [userResult, courseResult] = await Promise.all([
        getUserByIdFromDB(userId),
        getACourseFromDBById(courseId),
      ]);

      if (userResult.data && courseResult.data) {
        sendCourseEnrollmentEmail({
          email: userResult.data.email,
          name: userResult.data.name,
          id: userId,
          courseName: courseResult.data.name,
          courseDescription: courseResult.data.description,
        }).catch((error) => {
          logger.error("Failed to send course enrollment email", {
            error: error instanceof Error ? error.message : String(error),
          });
        });
      }
    } catch (error) {
      logger.error("Error fetching user/course data for email", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: "Successfully enrolled in course",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed while enrolling course",
        error,
      }),
    );
  }
};

export default withApiHandler(handler);
