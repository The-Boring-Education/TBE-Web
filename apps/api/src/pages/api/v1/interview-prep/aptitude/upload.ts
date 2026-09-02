import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { bulkUploadAptitudeDataToDB } from "@/lib/database";
import type { AptitudeUploadPayload } from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils";
import { verifyAdminSecret } from "@/middleware/adminSecret";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} Not Allowed`,
      }),
    );
  }

  if (!verifyAdminSecret(req, res)) return;

  const { topic, questions } = req.body as AptitudeUploadPayload;

  if (!topic) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Required: topic (slug string)",
      }),
    );
  }

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Required: questions array with at least one entry",
      }),
    );
  }

  const { data, error, details } = await bulkUploadAptitudeDataToDB({
    topic,
    questions,
  });

  if (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Bulk upload failed",
        error,
      }),
    );
  }

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data,
      message: `Topic "${topic}": ${data.questionsAdded} added, ${data.questionsUpdated} updated, ${data.totalQuestions} total`,
    }),
  );
};

export default withApiHandler(handler);
