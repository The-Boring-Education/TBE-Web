import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  getDsaYatraFeedbackFromDB,
  upsertDsaYatraFeedbackInDB,
} from "@/lib/database";
import type {
  GetDsaYatraFeedbackQueryProps,
  PostDsaYatraFeedbackProps,
} from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils";
import { withUserAuth } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";
import { getAuthenticatedUserId, verifyOwnership } from "@/middleware/userAuth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const authenticatedUserId = getAuthenticatedUserId(req, res);
    if (!authenticatedUserId) return;

    const { method } = req;

    switch (method) {
      case "GET":
        return withUserAuth(
          async (req, res) => handleGetFeedback(req, res, authenticatedUserId),
          { ownerRequired: true },
        )(req, res);
      case "POST":
        return withUserAuth(
          async (req, res) =>
            handleUpsertFeedback(req, res, authenticatedUserId),
          { ownerRequired: true },
        )(req, res);
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

const handleGetFeedback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  authenticatedUserId: string,
) => {
  const { userId, questionId } =
    req.query as unknown as GetDsaYatraFeedbackQueryProps;

  if (!userId || !questionId) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "userId and questionId are required",
      }),
    );
  }

  if (!verifyOwnership(authenticatedUserId, userId, res)) return;

  try {
    const { data, error } = await getDsaYatraFeedbackFromDB(
      userId,
      String(questionId),
    );

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message:
            typeof error === "string" ? error : "Failed to load feedback",
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: "DSA Yatra feedback loaded",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to load feedback",
        error,
      }),
    );
  }
};

const handleUpsertFeedback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  authenticatedUserId: string,
) => {
  const { userId, questionId, rating, reviewText } = (req.body ??
    {}) as PostDsaYatraFeedbackProps;

  if (!userId || questionId === undefined || questionId === null) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "userId and questionId are required",
      }),
    );
  }

  if (!verifyOwnership(authenticatedUserId, userId, res)) return;

  if (
    typeof rating !== "number" ||
    !Number.isFinite(rating) ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "rating must be an integer between 1 and 5",
      }),
    );
  }

  if (reviewText !== undefined && typeof reviewText !== "string") {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "reviewText must be a string",
      }),
    );
  }

  try {
    const { data, error } = await upsertDsaYatraFeedbackInDB(
      userId,
      String(questionId),
      rating,
      reviewText,
    );

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed to save feedback",
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: "Feedback saved",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to save feedback",
        error,
      }),
    );
  }
};

export default withApiHandler(handler);
