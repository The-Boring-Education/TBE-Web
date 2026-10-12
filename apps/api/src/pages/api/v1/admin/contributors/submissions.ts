import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import Contribution from "@/lib/database/models/Contribution";
import Contributor from "@/lib/database/models/Contributor";
import { sendAPIResponse } from "@/lib/utils";
import {
  type AdminAuthenticatedRequest,
  withAdminAuth,
} from "@/middleware/admin";
import { connectDB } from "@/middleware/api";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (
  req: AdminAuthenticatedRequest,
  res: NextApiResponse,
) => {
  await connectDB();

  switch (req.method) {
    case "GET":
      return handleGetSubmissions(req, res);
    case "PATCH":
      return handleReviewSubmission(req, res);
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
) => {
  try {
    const { status, search } = req.query;
    const filter: Record<string, unknown> = {};

    if (typeof status === "string" && status !== "All") {
      filter.status = status.toLowerCase();
    }

    if (typeof search === "string" && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { contributorName: regex },
        { contributorEmail: regex },
        { title: regex },
      ];
    }

    const submissions = await Contribution.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: submissions,
        message: "Admin submissions retrieved successfully",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Error fetching admin submissions",
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
};

const handleReviewSubmission = async (
  req: AdminAuthenticatedRequest,
  res: NextApiResponse,
) => {
  try {
    const { id, action, awardedXp, feedback } = req.body;

    if (!id || !["approve", "reject"].includes(action)) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "id and valid action ('approve' or 'reject') are required",
        }),
      );
    }

    const contribution = await Contribution.findById(id);
    if (!contribution) {
      return res
        .status(apiStatusCodes.NOT_FOUND)
        .json(
          sendAPIResponse({ status: false, message: "Contribution not found" }),
        );
    }

    const previousStatus = contribution.status;
    const adminEmail = req.adminUser?.email || "admin@theboringeducation.com";

    if (action === "approve") {
      const finalXp =
        typeof awardedXp === "number" && awardedXp >= 0
          ? awardedXp
          : contribution.standardXp;

      contribution.status = "approved";
      contribution.awardedXp = finalXp;
      contribution.adminFeedback = feedback || "";
      contribution.reviewedBy = adminEmail;
      contribution.reviewedAt = new Date();
      await contribution.save();

      // Update Contributor record
      const contributor = await Contributor.findById(
        contribution.contributorId,
      );
      if (contributor) {
        contributor.totalXp += finalXp;
        contributor.approvedCount += 1;
        if (previousStatus === "pending") {
          contributor.pendingCount = Math.max(0, contributor.pendingCount - 1);
        }

        // Check 100 XP Captain threshold
        if (contributor.totalXp >= 100 && !contributor.isCaptain) {
          contributor.role = "TBE Captain";
          contributor.isCaptain = true;
          contributor.captainUnlockedAt = new Date();
        }

        await contributor.save();
      }

      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          data: contribution,
          message: `Contribution approved and awarded ${finalXp} XP successfully`,
        }),
      );
    } else {
      // Rejection
      contribution.status = "rejected";
      contribution.awardedXp = 0;
      contribution.adminFeedback =
        feedback || "Submission does not meet criteria.";
      contribution.reviewedBy = adminEmail;
      contribution.reviewedAt = new Date();
      await contribution.save();

      if (previousStatus === "pending") {
        await Contributor.findByIdAndUpdate(contribution.contributorId, {
          $inc: { pendingCount: -1 },
        });
      }

      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          data: contribution,
          message: "Contribution rejected with feedback",
        }),
      );
    }
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Error reviewing contribution",
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
};

export default withApiHandler(withAdminAuth(handler));
