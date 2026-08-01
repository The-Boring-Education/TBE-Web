import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import type {
  ExternalEmailRequest,
  ExternalEmailResponse,
} from "@/lib/interfaces";
import { emailTriggerService } from "@/lib/services";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { adminMiddleware } from "@/middleware/api";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const isAdmin = await adminMiddleware(req, res);
    if (!isAdmin) return;

    switch (req.method) {
      case "POST":
        return handleExternalEmail(req, res);
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
        message: "Something went wrong",
        error,
      }),
    );
  }
};

const handleExternalEmail = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const { emailType, userData, additionalData } =
      req.body as ExternalEmailRequest;

    // Validate required fields
    if (!emailType || !userData) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Missing required fields: emailType, userData",
        }),
      );
    }

    if (!userData.email || !userData.name || !userData.id) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Missing required user data: email, name, id",
        }),
      );
    }

    // Send email using the external email service
    const result: ExternalEmailResponse =
      await emailTriggerService.sendExternalEmail({
        emailType,
        userData,
        additionalData,
      });

    if (result.success) {
      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          message: result.message,
          data: {
            requestId: result.requestId,
            emailType,
            userEmail: userData.email,
          },
        }),
      );
    } else {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: result.message,
          error: result.error,
          data: {
            requestId: result.requestId,
            emailType,
            userEmail: userData.email,
          },
        }),
      );
    }
  } catch (error) {
    logger.error("External email sending error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to send email",
        error,
      }),
    );
  }
};

export default withApiHandler(handler);
