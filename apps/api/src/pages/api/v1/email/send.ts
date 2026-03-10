import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { sendEmailFromDB } from "@/lib/database";
import type { EmailRequest } from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils";
import { connectDB } from "@/middleware/api";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();

    switch (req.method) {
      case "POST":
        return handleSendEmail(req, res);
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

const handleSendEmail = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { from_email, from_name, to_email, to_name, subject, html_content } =
      req.body as EmailRequest;

    if (!to_email || !subject || !html_content) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Missing required fields: to_email, subject, html_content",
        }),
      );
    }

    const { data, error } = await sendEmailFromDB({
      from_email,
      from_name,
      to_email,
      to_name,
      subject,
      html_content,
    });

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed to send email",
          error,
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
    console.error("Email sending error:", error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to send email",
        error,
      }),
    );
  }
};

export default handler;
