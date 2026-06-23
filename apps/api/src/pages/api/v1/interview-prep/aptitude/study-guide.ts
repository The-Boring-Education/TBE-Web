import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  checkPaymentStatusFromDB,
  getAptitudeStudyGuideByTopicFromDB,
  upsertAptitudeStudyGuideToDB,
} from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      return handleGet(req, res);
    case "POST":
      return handleUpload(req, res);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        }),
      );
  }
};

// GET /api/v1/interview-prep/aptitude/study-guide?topic=<slug>
const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const { topic, userId } = req.query;

  if (!topic || typeof topic !== "string") {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Required query param: topic (slug string)",
      }),
    );
  }

  const isPaidUser =
    typeof userId === "string"
      ? (await checkPaymentStatusFromDB(userId, "oncampus", "ONCAMPUS")).data
          ?.purchased === true
      : false;

  const { data, error } = await getAptitudeStudyGuideByTopicFromDB(
    topic,
    isPaidUser,
  );

  if (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to fetch study guide",
        error,
      }),
    );
  }

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data,
      message: data
        ? `Study guide for "${topic}"`
        : "No study guide available for this topic",
    }),
  );
};

// POST /api/v1/interview-prep/aptitude/study-guide
// Protected by x-admin-secret header
const handleUpload = async (req: NextApiRequest, res: NextApiResponse) => {
  const adminSecret = req.headers["x-admin-secret"];
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res
      .status(apiStatusCodes.UNAUTHORIZED)
      .json(sendAPIResponse({ status: false, message: "Unauthorized" }));
  }

  const { topic, content } = req.body as { topic: string; content: string };

  if (!topic) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Required: topic (slug string)",
      }),
    );
  }

  if (!content) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Required: content (markdown string)",
      }),
    );
  }

  const { data, error } = await upsertAptitudeStudyGuideToDB(topic, content);

  if (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to save study guide",
        error,
      }),
    );
  }

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data,
      message: `Study guide saved for topic "${topic}"`,
    }),
  );
};

export default withApiHandler(handler);
