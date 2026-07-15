import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { DevRelLead } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { adminMiddleware } from "@/middleware/api";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const isAdmin = await adminMiddleware(req, res);
  if (!isAdmin) return;

  if (req.method !== "GET") {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: "Method not allowed",
      }),
    );
  }

  try {
    const { email } = req.query;

    if (!email || typeof email !== "string") {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Email parameter is required",
        }),
      );
    }

    // Check if application exists
    const application = await DevRelLead.findOne({
      email: email.toLowerCase(),
    });

    if (!application) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: true,
          data: null,
          message: "No application found for this email",
        }),
      );
    }

    // Return application status
    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: {
          id: application._id,
          email: application.email,
          status: application.status,
          submittedAt: application.createdAt,
          rejectedAt: application.rejectedAt,
          rejectionReason: application.rejectionReason,
          interviewDate: application.interviewData?.scheduledAt,
          interviewLink: application.interviewData?.meetingLink,
        },
        message: "Application status retrieved successfully",
      }),
    );
  } catch (error) {
    logger.error("Error checking application status", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        error: true,
        message: "Internal server error while checking application status",
      }),
    );
  }
};

export default withApiHandler(handler);
