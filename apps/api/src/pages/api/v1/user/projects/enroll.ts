import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  enrollInAProject,
  getEnrolledProjectFromDB,
  getProjectByIDFromDB,
  getUserByIdFromDB,
} from "@/lib/database";
import type { ProjectEnrollmentRequestProps } from "@/lib/interfaces";
import { sendProjectEnrollmentEmail } from "@/lib/services";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "POST":
        return handleProjectEnrollment(req, res);
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

const handleProjectEnrollment = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { userId, projectId } = req.body as ProjectEnrollmentRequestProps;

  try {
    const { data: alreadyExists, error: fetchEnrolledProjectError } =
      await getEnrolledProjectFromDB({ projectId, userId });

    if (fetchEnrolledProjectError)
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed while checking project enrollment",
        }),
      );

    if (alreadyExists)
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Already enrolled in project",
        }),
      );

    const { data, error } = await enrollInAProject({ userId, projectId });

    if (error)
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed while enrolling in project",
        }),
      );

    // Send project enrollment email (non-blocking)
    try {
      const [userResult, projectResult] = await Promise.all([
        getUserByIdFromDB(userId),
        getProjectByIDFromDB(projectId),
      ]);

      if (userResult.data && projectResult.data) {
        sendProjectEnrollmentEmail({
          email: userResult.data.email,
          name: userResult.data.name,
          id: userId,
          projectName: projectResult.data.name,
          projectDescription: projectResult.data.description,
        }).catch((error) => {
          logger.error("Failed to send project enrollment email", {
            error: error instanceof Error ? error.message : String(error),
          });
        });
      }
    } catch (error) {
      logger.error("Error fetching user/project data for email", {
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't fail the enrollment if email data fetch fails
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: "Successfully enrolled in project",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed while enrolling in project",
        error,
      }),
    );
  }
};

export default withApiHandler(handler);
