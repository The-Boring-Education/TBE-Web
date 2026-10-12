import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import Contribution from "@/lib/database/models/Contribution";
import Contributor from "@/lib/database/models/Contributor";
import User from "@/lib/database/models/User";
import { sendAPIResponse } from "@/lib/utils";
import { verifyAuthenticatedUser } from "@/middleware/admin";
import { connectDB } from "@/middleware/api";
import { withApiHandler } from "@/middleware/requestLogger";

const CATEGORY_BASELINE_XP: Record<string, number> = {
  PR_BUG_FIX: 5,
  CREATE_ISSUE: 3,
  REVIEW_PR: 2,
  POST: 5,
  EVENT_SESSION: 15,
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const authUser = verifyAuthenticatedUser(req);
  if (!authUser || !authUser.sub) {
    return res
      .status(apiStatusCodes.UNAUTHORIZED)
      .json(
        sendAPIResponse({ status: false, message: "Authentication required" }),
      );
  }

  await connectDB();

  switch (req.method) {
    case "GET":
      return handleGetSubmissions(req, res, authUser.sub);
    case "POST":
      return handleCreateSubmission(req, res, authUser);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} not allowed`,
        }),
      );
  }
};

const handleGetSubmissions = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
) => {
  try {
    const { category, status } = req.query;
    const filter: Record<string, unknown> = { userId };

    if (typeof category === "string" && category !== "All") {
      filter.category = category;
    }
    if (typeof status === "string" && status !== "All") {
      filter.status = status.toLowerCase();
    }

    const submissions = await Contribution.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: submissions,
        message: "Submissions retrieved successfully",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Error fetching submissions",
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
};

const handleCreateSubmission = async (
  req: NextApiRequest,
  res: NextApiResponse,
  authUser: { sub: string; email?: string; name?: string },
) => {
  try {
    const { category, title, proofUrl, description } = req.body;

    if (!category || !title || !proofUrl) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "category, title, and proofUrl are required",
        }),
      );
    }

    // Ensure contributor profile exists
    let contributor = await Contributor.findOne({ userId: authUser.sub });
    if (!contributor) {
      const user = await User.findById(authUser.sub);
      contributor = await Contributor.create({
        userId: authUser.sub,
        email: authUser.email || user?.email,
        name: authUser.name || user?.name || "Contributor",
        avatar: user?.image || "",
        totalXp: 0,
        role: "Contributor",
        isCaptain: false,
        approvedCount: 0,
        pendingCount: 0,
      });
    }

    const standardXp = CATEGORY_BASELINE_XP[category] || 5;

    const newSubmission = await Contribution.create({
      contributorId: contributor._id,
      userId: authUser.sub,
      contributorName: contributor.name,
      contributorEmail: contributor.email,
      category,
      proofUrl: proofUrl.trim(),
      title: title.trim(),
      description: description ? description.trim() : "",
      standardXp,
      awardedXp: 0,
      status: "pending",
    });

    await Contributor.findByIdAndUpdate(contributor._id, {
      $inc: { pendingCount: 1 },
    });

    return res.status(apiStatusCodes.RESOURCE_CREATED).json(
      sendAPIResponse({
        status: true,
        data: newSubmission,
        message: "Contribution submitted successfully",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Error submitting contribution",
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
};

export default withApiHandler(handler);
