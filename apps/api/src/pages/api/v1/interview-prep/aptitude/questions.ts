import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { addAptitudeQuestionToDB } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { verifyAdminSecret } from "@/middleware/adminSecret";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} Not Allowed. Use GET /api/v1/interview-prep/aptitude/questions?topic=<slug> to fetch questions.`,
      }),
    );
  }

  if (!verifyAdminSecret(req, res)) return;

  const { topic, question, options, answer, difficulty, order } = req.body;

  if (!topic || !question) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Required: topic (slug), question",
      }),
    );
  }

  const { data, error } = await addAptitudeQuestionToDB(topic, {
    question,
    options,
    answer,
    difficulty: difficulty || "MEDIUM",
    order: order || 0,
  });

  if (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to create question",
        error,
      }),
    );
  }

  return res
    .status(apiStatusCodes.RESOURCE_CREATED)
    .json(sendAPIResponse({ status: true, data, message: "Question created" }));
};

export default withApiHandler(handler);
