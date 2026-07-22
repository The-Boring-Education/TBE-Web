import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { getResumeEvaluationResultsFromDB } from "@/lib/database";
import type { UnSkilledEvaluationRequestBody } from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} not allowed`,
      }),
    );
  }

  try {
    const { skills, domains, experience } =
      req.body as UnSkilledEvaluationRequestBody;

    if (!skills || !domains || !experience) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Missing required fields in request body",
        }),
      );
    }

    // Validate experience values are numbers to prevent NoSQL operator injection
    if (
      typeof experience.min !== "number" ||
      typeof experience.max !== "number" ||
      !Number.isFinite(experience.min) ||
      !Number.isFinite(experience.max)
    ) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "experience.min and experience.max must be valid numbers",
        }),
      );
    }

    const { data, error } = await getResumeEvaluationResultsFromDB({
      skills,
      domains,
      experience,
    });

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed to evaluate your resume",
          error,
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Resume evaluation successfully",
        data,
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Error while evaluating resume",
        error,
      }),
    );
  }
};

export default withApiHandler(handler);
