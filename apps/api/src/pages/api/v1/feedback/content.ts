import type { NextApiRequest, NextApiResponse } from "next";

import {
  apiStatusCodes,
  CONTENT_FEEDBACK_KINDS,
  CONTENT_FEEDBACK_TYPES,
  type ContentFeedbackKind,
  type ContentFeedbackType,
} from "@/lib/constants";
import {
  createContentFeedbackToDB,
  getContentFeedbackFromDB,
} from "@/lib/database";
import {
  captureAPIError,
  captureAuthError,
  sendAPIResponse,
} from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { firstQueryValue } from "@/lib/validation";
import { verifyAuthenticatedUser } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

const ENDPOINT = "/api/v1/feedback/content";

const isValidContentType = (v: unknown): v is ContentFeedbackType =>
  typeof v === "string" &&
  (CONTENT_FEEDBACK_TYPES as readonly string[]).includes(v);

const isValidFeedbackKind = (v: unknown): v is ContentFeedbackKind =>
  typeof v === "string" &&
  (CONTENT_FEEDBACK_KINDS as readonly string[]).includes(v);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "POST":
        return await handlePostContentFeedback(req, res);
      case "GET":
        return await handleGetContentFeedback(req, res);
      default:
        return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
          sendAPIResponse({
            status: false,
            message: `Method ${req.method} Not Allowed`,
          }),
        );
    }
  } catch (error) {
    captureAPIError(
      error instanceof Error ? error : new Error(String(error)),
      ENDPOINT,
      req.method || "UNKNOWN",
      apiStatusCodes.INTERNAL_SERVER_ERROR,
    );
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Something went wrong",
        error,
      }),
    );
  }
};

const handlePostContentFeedback = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const auth = verifyAuthenticatedUser(req);
  if (!auth?.sub) {
    captureAuthError(new Error("Missing or invalid access token"), "bearer");
    return res.status(apiStatusCodes.UNAUTHORIZED).json(
      sendAPIResponse({
        status: false,
        message: "Authentication required",
      }),
    );
  }

  const {
    contentType,
    contentId,
    feedbackKind,
    message,
    rating,
    suggestedEdit,
  } = req.body ?? {};

  if (!isValidContentType(contentType)) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Invalid or missing contentType",
      }),
    );
  }

  if (typeof contentId !== "string" || !contentId.trim()) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "contentId is required",
      }),
    );
  }

  if (!isValidFeedbackKind(feedbackKind)) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Invalid or missing feedbackKind",
      }),
    );
  }

  if (
    typeof message !== "string" ||
    message.trim().length < 5 ||
    message.trim().length > 2000
  ) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "message must be between 5 and 2000 characters",
      }),
    );
  }

  let normalizedRating: number | undefined;
  if (rating !== undefined && rating !== null) {
    const num = Number(rating);
    if (!Number.isFinite(num) || num < 1 || num > 5) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "rating must be a number between 1 and 5",
        }),
      );
    }
    normalizedRating = Math.round(num);
  }

  if (
    suggestedEdit !== undefined &&
    (typeof suggestedEdit !== "string" || suggestedEdit.length > 5000)
  ) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "suggestedEdit must be a string of at most 5000 characters",
      }),
    );
  }

  const { data, error } = await createContentFeedbackToDB({
    userId: auth.sub,
    contentType,
    contentId: contentId.trim(),
    feedbackKind,
    message: message.trim(),
    rating: normalizedRating,
    suggestedEdit:
      typeof suggestedEdit === "string" && suggestedEdit.trim()
        ? suggestedEdit.trim()
        : undefined,
  });

  if (error) {
    captureAPIError(
      new Error(
        typeof error === "string" ? error : "createContentFeedbackToDB",
      ),
      ENDPOINT,
      "POST",
      apiStatusCodes.INTERNAL_SERVER_ERROR,
      { contentType, contentId, feedbackKind },
    );
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to submit feedback",
        error,
      }),
    );
  }

  logger.info("Content feedback submitted", {
    contentType,
    contentId,
    feedbackKind,
    userId: auth.sub,
  });

  return res.status(apiStatusCodes.RESOURCE_CREATED).json(
    sendAPIResponse({
      status: true,
      message: "Feedback submitted. Thanks for helping us improve!",
      data,
    }),
  );
};

const handleGetContentFeedback = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const contentType = firstQueryValue(req.query.contentType);
  const contentId = firstQueryValue(req.query.contentId);

  if (!isValidContentType(contentType)) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Invalid or missing contentType",
      }),
    );
  }

  if (!contentId) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "contentId is required",
      }),
    );
  }

  const { data, error } = await getContentFeedbackFromDB({
    contentType,
    contentId,
  });

  if (error) {
    captureAPIError(
      new Error(typeof error === "string" ? error : "getContentFeedbackFromDB"),
      ENDPOINT,
      "GET",
      apiStatusCodes.INTERNAL_SERVER_ERROR,
      { contentType, contentId },
    );
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
      message: "Content feedback fetched successfully",
      data: { items: data ?? [] },
    }),
  );
};

export default withApiHandler(handler);
