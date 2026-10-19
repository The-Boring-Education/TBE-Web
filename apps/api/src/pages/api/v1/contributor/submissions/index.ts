import type { NextApiRequest, NextApiResponse } from "next";

import {
  apiStatusCodes,
  CONTRIBUTION_CATEGORIES,
  type ContributionCategoryType,
  type ContributionStatusType,
  type ContributionTypeGroup,
} from "@/lib/constants";
import {
  createContributionInDB,
  getContributionsByUserIdFromDB,
  getOrCreateContributorInDB,
  getUserByIdFromDB,
} from "@/lib/database";
import type { CreateContributionPayload } from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";
import { getAuthenticatedUserId } from "@/middleware/userAuth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) return;

  if (req.method === "GET") {
    const {
      status,
      category,
      typeGroup,
      page = "1",
      limit = "20",
    } = req.query as {
      status?: ContributionStatusType;
      category?: ContributionCategoryType;
      typeGroup?: ContributionTypeGroup;
      page?: string;
      limit?: string;
    };

    const { data, error } = await getContributionsByUserIdFromDB(userId, {
      status,
      category,
      typeGroup,
      page: Math.max(1, parseInt(page, 10) || 1),
      limit: Math.min(100, Math.max(1, parseInt(limit, 10) || 20)),
    });

    if (error) {
      return res
        .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          sendAPIResponse({
            status: false,
            message: "Failed to fetch submissions",
            error,
          }),
        );
    }
    return res
      .status(apiStatusCodes.OKAY)
      .json(sendAPIResponse({ status: true, data }));
  }

  if (req.method === "POST") {
    const { category, title, proofUrl, description } = (req.body ||
      {}) as CreateContributionPayload;

    if (
      !category ||
      !CONTRIBUTION_CATEGORIES.includes(category as ContributionCategoryType)
    ) {
      return res
        .status(apiStatusCodes.BAD_REQUEST)
        .json(
          sendAPIResponse({
            status: false,
            message: `Invalid category. Must be one of: ${CONTRIBUTION_CATEGORIES.join(", ")}`,
          }),
        );
    }

    if (
      typeof title !== "string" ||
      typeof proofUrl !== "string" ||
      !title.trim() ||
      !proofUrl.trim()
    ) {
      return res
        .status(apiStatusCodes.BAD_REQUEST)
        .json(
          sendAPIResponse({
            status: false,
            message: "Valid title and proof URL strings are required",
          }),
        );
    }

    const { data: user, error: userError } = await getUserByIdFromDB(userId);
    if (userError) {
      return res
        .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          sendAPIResponse({
            status: false,
            message: "Database error while fetching user",
            error: userError,
          }),
        );
    }

    if (!user) {
      return res
        .status(apiStatusCodes.NOT_FOUND)
        .json(sendAPIResponse({ status: false, message: "User not found" }));
    }

    const { data: contributor, error: contributorError } =
      await getOrCreateContributorInDB({
        userId,
        email: user.email,
        name: user.name || "Contributor",
        avatar: user.image,
      });

    if (contributorError || !contributor) {
      return res
        .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          sendAPIResponse({
            status: false,
            message: "Failed to initialize contributor profile",
            error: contributorError,
          }),
        );
    }

    const { data, error } = await createContributionInDB({
      contributorId: contributor._id,
      userId,
      contributorName: contributor.name,
      contributorEmail: contributor.email,
      category,
      proofUrl: proofUrl.trim(),
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : undefined,
    });

    if (error) {
      return res
        .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          sendAPIResponse({
            status: false,
            message: "Submission failed",
            error,
          }),
        );
    }

    return res
      .status(apiStatusCodes.RESOURCE_CREATED)
      .json(
        sendAPIResponse({
          status: true,
          message: "Contribution submitted successfully",
          data,
        }),
      );
  }

  return res
    .status(apiStatusCodes.METHOD_NOT_ALLOWED)
    .json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} Not Allowed`,
      }),
    );
};

export default withApiHandler(handler);
