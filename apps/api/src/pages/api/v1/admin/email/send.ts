import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { envConfig } from "@/lib/constants/envConfig";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withVerifiedAdminAuth } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

interface SendEmailRequest {
  from_email: string;
  from_name: string;
  to_email: string;
  to_name: string;
  subject: string;
  html_content: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: "Method not allowed",
      }),
    );
  }

  const emailServiceUrl = envConfig.EMAIL_SERVICE_URL;
  const emailApiKey = envConfig.EMAIL_API_KEY;

  if (!emailServiceUrl || !emailApiKey) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Email service is not configured",
      }),
    );
  }

  const body = req.body as SendEmailRequest;
  const requiredFields: (keyof SendEmailRequest)[] = [
    "from_email",
    "from_name",
    "to_email",
    "to_name",
    "subject",
    "html_content",
  ];

  for (const field of requiredFields) {
    if (!body[field] || typeof body[field] !== "string") {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `${field} is required`,
        }),
      );
    }
  }

  try {
    const response = await fetch(`${emailServiceUrl}/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Breevo-API-Key": emailApiKey,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return res.status(response.status).json(
        sendAPIResponse({
          status: false,
          message: data?.message || "Failed to send email",
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Email sent successfully",
        data,
      }),
    );
  } catch (error) {
    logger.error("Admin email send failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal server error while sending email",
      }),
    );
  }
};

export default withApiHandler(withVerifiedAdminAuth(handler));
