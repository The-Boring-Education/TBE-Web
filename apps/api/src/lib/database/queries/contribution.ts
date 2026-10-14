import mongoose from "mongoose";

import {
  BASELINE_CATEGORY_XP,
  CATEGORY_TO_TYPE_GROUP,
  type ContributionCategoryType,
  type ContributionStatusType,
  type ContributionTypeGroup,
} from "@/lib/constants";
import type { DatabaseQueryResponseType } from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import { Contribution } from "../models";
import { toObjectId } from "./common";
import { updateContributorStatsInDB } from "./contributor";

export interface CreateContributionInput {
  contributorId: string;
  userId: string;
  contributorName: string;
  contributorEmail: string;
  category: ContributionCategoryType;
  proofUrl: string;
  title: string;
  description?: string;
}

export interface GetUserContributionsFilter {
  status?: ContributionStatusType;
  category?: ContributionCategoryType;
  typeGroup?: ContributionTypeGroup;
  page?: number;
  limit?: number;
}

export interface GetAdminContributionsFilter {
  status?: ContributionStatusType | "all";
  category?: ContributionCategoryType;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ReviewContributionInput {
  contributionId: string;
  adminEmail: string;
  action: "approve" | "reject";
  awardedXp?: number;
  feedback?: string;
}

/**
 * Creates a new contribution submission in pending status and increments
 * the contributor's pending count.
 */
export const createContributionInDB = async ({
  contributorId,
  userId,
  contributorName,
  contributorEmail,
  category,
  proofUrl,
  title,
  description,
}: CreateContributionInput): Promise<DatabaseQueryResponseType> => {
  try {
    if (
      !mongoose.isValidObjectId(contributorId) ||
      !mongoose.isValidObjectId(userId)
    ) {
      return { error: "Invalid contributor ID or user ID provided" };
    }

    const standardXp = BASELINE_CATEGORY_XP[category] ?? 5;
    const typeGroup = CATEGORY_TO_TYPE_GROUP[category] ?? "content";

    const contribution = new Contribution({
      contributorId: toObjectId(contributorId),
      userId: toObjectId(userId),
      contributorName: contributorName.trim(),
      contributorEmail: contributorEmail.trim().toLowerCase(),
      category,
      typeGroup,
      proofUrl: proofUrl.trim(),
      title: title.trim(),
      description: description?.trim(),
      standardXp,
      awardedXp: 0,
      status: "pending",
    });

    await contribution.save();

    // Increment pending submissions count
    await updateContributorStatsInDB({
      contributorId,
      pendingDelta: 1,
    });

    return { data: contribution };
  } catch (error) {
    logger.error("DB: createContributionInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed to create contribution submission",
      details: error,
    };
  }
};

/**
 * Retrieves paginated contributions for an authenticated user with optional status and category filters.
 */
export const getContributionsByUserIdFromDB = async (
  userId: string,
  {
    status,
    category,
    typeGroup,
    page = 1,
    limit = 20,
  }: GetUserContributionsFilter = {},
): Promise<DatabaseQueryResponseType> => {
  try {
    if (!mongoose.isValidObjectId(userId)) {
      return { error: "Invalid user ID provided" };
    }

    const filter: Record<string, any> = {
      userId: toObjectId(userId),
    };

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (typeGroup) {
      filter.typeGroup = typeGroup;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Contribution.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Contribution.countDocuments(filter),
    ]);

    return {
      data: {
        items,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error("DB: getContributionsByUserIdFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed to fetch user contributions history",
      details: error,
    };
  }
};

/**
 * Retrieves filtered, searched, and paginated contributions for the admin moderation queue.
 */
export const getContributionsForAdminFromDB = async ({
  status,
  category,
  search,
  page = 1,
  limit = 20,
}: GetAdminContributionsFilter = {}): Promise<DatabaseQueryResponseType> => {
  try {
    const filter: Record<string, any> = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (search && search.trim()) {
      const cleanSearch = search
        .trim()
        .slice(0, 100)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(cleanSearch, "i");
      filter.$or = [
        { title: searchRegex },
        { contributorName: searchRegex },
        { contributorEmail: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Contribution.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Contribution.countDocuments(filter),
    ]);

    return {
      data: {
        items,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error("DB: getContributionsForAdminFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed to fetch contributions for admin moderation",
      details: error,
    };
  }
};

/**
 * Reviews a contribution (approve or reject) with admin feedback, updates awarded XP,
 * and atomically synchronizes contributor statistics and Captain role.
 */
export const reviewContributionInDB = async ({
  contributionId,
  adminEmail,
  action,
  awardedXp,
  feedback,
}: ReviewContributionInput): Promise<DatabaseQueryResponseType> => {
  try {
    if (!mongoose.isValidObjectId(contributionId)) {
      return { error: "Invalid contribution ID provided" };
    }

    const objectId = toObjectId(contributionId);
    const existing = await Contribution.findById(objectId);

    if (!existing) {
      return { error: "Contribution submission not found" };
    }

    if (existing.status !== "pending") {
      return {
        error: `Contribution has already been reviewed (current status: ${existing.status})`,
      };
    }

    const finalXp =
      action === "approve"
        ? typeof awardedXp === "number" && awardedXp >= 0
          ? awardedXp
          : existing.standardXp
        : 0;

    const contribution = await Contribution.findOneAndUpdate(
      { _id: objectId, status: "pending" },
      {
        $set: {
          status: action === "approve" ? "approved" : "rejected",
          awardedXp: finalXp,
          adminFeedback:
            feedback?.trim() ||
            (action === "approve"
              ? undefined
              : "Submission does not meet contribution guidelines."),
          reviewedBy: adminEmail.trim(),
          reviewedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!contribution) {
      return {
        error:
          "Contribution was already reviewed concurrently by another administrator",
      };
    }

    // Atomically adjust contributor statistics
    if (action === "approve") {
      await updateContributorStatsInDB({
        contributorId: contribution.contributorId,
        xpDelta: finalXp,
        approvedDelta: 1,
        pendingDelta: -1,
      });
    } else {
      await updateContributorStatsInDB({
        contributorId: contribution.contributorId,
        pendingDelta: -1,
      });
    }

    return { data: contribution };
  } catch (error) {
    logger.error("DB: reviewContributionInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed to review contribution submission",
      details: error,
    };
  }
};
