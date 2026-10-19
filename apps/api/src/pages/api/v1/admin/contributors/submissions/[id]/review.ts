import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { reviewContributionInDB } from "@/lib/database";
import type { ReviewContributionPayload } from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils";
import {
  type AdminAuthenticatedRequest,
  ensureAdminAccess,
} from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PATCH") {
    return res
      .status(apiStatusCodes.METHOD_NOT_ALLOWED)
      .json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        }),
      );
  }

  const isAdmin = await ensureAdminAccess(req, res);
  if (!isAdmin) return;

  const id = req.query.id as string;
  if (!id) {
    return res
      .status(apiStatusCodes.BAD_REQUEST)
      .json(
        sendAPIResponse({
          status: false,
          message: "Contribution ID is required",
        }),
      );
  }

  const { action, awardedXp, feedback } = (req.body ||
    {}) as ReviewContributionPayload;

  if (action !== "approve" && action !== "reject") {
    return res
      .status(apiStatusCodes.BAD_REQUEST)
      .json(
        sendAPIResponse({
          status: false,
          message: "Action must be either 'approve' or 'reject'",
        }),
      );
  }

  if (action === "approve" && awardedXp !== undefined) {
    if (
      typeof awardedXp !== "number" ||
      !Number.isInteger(awardedXp) ||
      awardedXp < 0 ||
      awardedXp > 500
    ) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "awardedXp must be an integer between 0 and 500",
        }),
      );
    }
  }

  if (action === "reject" && !feedback?.trim()) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message:
          "Rejection feedback note is required to explain why submission was rejected",
      }),
    );
  }

  const adminEmail =
    (req as AdminAuthenticatedRequest).adminUser?.email ||
    "admin@theboringeducation.com";

  const { data, error } = await reviewContributionInDB({
    contributionId: id,
    adminEmail,
    action,
    awardedXp,
    feedback,
  });

  if (error) {
    let statusCode = apiStatusCodes.BAD_REQUEST;
    if (error === "Contribution submission not found") {
      statusCode = apiStatusCodes.NOT_FOUND;
    } else if (error.includes("Failed to review")) {
      statusCode = apiStatusCodes.INTERNAL_SERVER_ERROR;
    }
    return res
      .status(statusCode)
      .json(sendAPIResponse({ status: false, message: error }));
  }

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      message:
        action === "approve"
          ? "Contribution approved successfully"
          : "Contribution rejected",
      data,
    }),
  );
};

export default withApiHandler(handler);
