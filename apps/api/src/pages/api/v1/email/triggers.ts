import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import type { EmailTriggerRequest } from "@/lib/interfaces";
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
        return handleEmailTrigger(req, res);
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

const handleEmailTrigger = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const { trigger, data } = req.body as EmailTriggerRequest;

    if (!trigger || !data) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Missing required fields: trigger, data",
        }),
      );
    }

    if (!data.userEmail || !data.userName || !data.userId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Missing required user data: userEmail, userName, userId",
        }),
      );
    }

    const result = await emailTriggerService.sendTriggerEmail(trigger, data);

    if (result.success) {
      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          message: `${trigger} email sent successfully`,
          data: result,
        }),
      );
    } else {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: `Failed to send ${trigger} email`,
          error: result.error,
        }),
      );
    }
  } catch (error) {
    logger.error("Email trigger error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to send email trigger",
        error,
      }),
    );
  }
};

export default withApiHandler(handler);
