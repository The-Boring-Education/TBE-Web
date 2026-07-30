import type { NextApiRequest, NextApiResponse } from "next";

import type { FeedbackType } from "@/lib/constants";
import { FEEDBACK_TYPES } from "@/lib/constants";
import { apiStatusCodes } from "@/lib/constants";
import {
  getContentFeedbackFromDB,
  upsertContentFeedbackInDB,
} from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { withUserAuth } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "GET":
        return await handleGetContentFeedback(req, res);
      case "POST":
        return await handleUpsertContentFeedback(req, res);
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

// ─── GET /api/v1/content-feedback?userId=&contentType=&contentId= ───────────

const handleGetContentFeedback = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { userId, contentType, contentId } = req.query;

  const normalizedUserId = Array.isArray(userId) ? userId[0] : userId;
  const normalizedContentType = Array.isArray(contentType)
    ? contentType[0]
    : contentType;
  const normalizedContentId = Array.isArray(contentId)
    ? contentId[0]
    : contentId;

  if (!normalizedUserId || !normalizedContentType || !normalizedContentId) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "userId, contentType, and contentId are required query params",
      }),
    );
  }

  if (!FEEDBACK_TYPES.includes(normalizedContentType as FeedbackType)) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: `Invalid contentType. Must be one of: ${FEEDBACK_TYPES.join(", ")}`,
      }),
    );
  }

  const { data, error } = await getContentFeedbackFromDB(
    normalizedUserId,
    normalizedContentType as FeedbackType,
    normalizedContentId,
  );

  if (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to fetch feedback",
        error,
      }),
    );
  }

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      message: "Feedback fetched successfully",
      data,
    }),
  );
};

// ─── POST /api/v1/content-feedback ───────────────────────────────────────────

const handleUpsertContentFeedback = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { userId, contentType, contentId, rating, reviewText, meta } = req.body;

  if (!userId || !contentType || !contentId || rating === undefined) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "userId, contentType, contentId, and rating are required",
      }),
    );
  }

  if (!FEEDBACK_TYPES.includes(contentType as FeedbackType)) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: `Invalid contentType. Must be one of: ${FEEDBACK_TYPES.join(", ")}`,
      }),
    );
  }

  const parsedRating = Number(rating);
  if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "rating must be an integer between 1 and 5",
      }),
    );
  }

  if (typeof contentId !== "string" || contentId.trim() === "") {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "contentId must be a non-empty string",
      }),
    );
  }

  const { data, error } = await upsertContentFeedbackInDB(
    userId,
    contentType as FeedbackType,
    contentId.trim(),
    parsedRating,
    typeof reviewText === "string" ? reviewText : "",
    meta && typeof meta === "object" ? meta : undefined,
  );

  if (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to save feedback",
        error,
      }),
    );
  }

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      message: "Feedback saved successfully",
      data,
    }),
  );
};

// Wrap with user auth (ownerRequired enforces userId matches JWT sub)
export default withApiHandler(withUserAuth(handler, { ownerRequired: true }));
