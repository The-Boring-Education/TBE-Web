import mongoose, { type ClientSession } from "mongoose";

import { CAPTAIN_XP_THRESHOLD } from "@/lib/constants";
import type { DatabaseQueryResponseType } from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import { Contributor } from "../models";
import { toObjectId } from "./common";

export interface CreateContributorInput {
  userId: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface UpdateContributorStatsInput {
  contributorId: string | mongoose.Types.ObjectId;
  xpDelta?: number;
  approvedDelta?: number;
  pendingDelta?: number;
  session?: ClientSession;
}

/**
 * Retrieves a contributor profile by user ID using a lean read query.
 */
export const getContributorByUserIdFromDB = async (
  userId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    if (!mongoose.isValidObjectId(userId)) {
      return { error: "Invalid user ID provided" };
    }

    const contributor = await Contributor.findOne({
      userId: toObjectId(userId),
    }).lean();

    if (!contributor) {
      return { error: "Contributor profile not found" };
    }

    return { data: contributor };
  } catch (error) {
    logger.error("DB: getContributorByUserIdFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to fetch contributor profile", details: error };
  }
};

/**
 * Retrieves or lazily initializes a contributor profile for an authenticated user atomically.
 */
export const getOrCreateContributorInDB = async ({
  userId,
  email,
  name,
  avatar,
}: CreateContributorInput): Promise<DatabaseQueryResponseType> => {
  try {
    if (!mongoose.isValidObjectId(userId)) {
      return { error: "Invalid user ID provided" };
    }

    const userObjectId = toObjectId(userId);
    const contributor = await Contributor.findOneAndUpdate(
      { userId: userObjectId },
      {
        $setOnInsert: {
          userId: userObjectId,
          email: email.trim().toLowerCase(),
          name: name.trim(),
          avatar: avatar?.trim(),
          role: "Contributor",
          totalXp: 0,
          approvedCount: 0,
          pendingCount: 0,
          isCaptain: false,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();

    return { data: contributor };
  } catch (error) {
    logger.error("DB: getOrCreateContributorInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed to get or create contributor profile",
      details: error,
    };
  }
};

/**
 * Atomically adjusts contributor statistics (XP, approved count, pending count)
 * and automatically promotes to TBE Captain if totalXp >= CAPTAIN_XP_THRESHOLD.
 */
export const updateContributorStatsInDB = async ({
  contributorId,
  xpDelta = 0,
  approvedDelta = 0,
  pendingDelta = 0,
  session,
}: UpdateContributorStatsInput): Promise<DatabaseQueryResponseType> => {
  try {
    const objectId =
      typeof contributorId === "string"
        ? toObjectId(contributorId)
        : contributorId;

    const updated = await Contributor.findByIdAndUpdate(
      objectId,
      {
        $inc: {
          totalXp: xpDelta,
          approvedCount: approvedDelta,
          pendingCount: pendingDelta,
        },
      },
      { new: true, runValidators: true, session },
    );

    if (!updated) {
      return { error: "Contributor not found for statistics update" };
    }

    // Auto-promote to TBE Captain if threshold reached
    if (updated.totalXp >= CAPTAIN_XP_THRESHOLD && !updated.isCaptain) {
      updated.isCaptain = true;
      updated.role = "TBE Captain";
      updated.captainUnlockedAt = new Date();
      await updated.save({ session });
    }

    return { data: updated };
  } catch (error) {
    logger.error("DB: updateContributorStatsInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to update contributor statistics", details: error };
  }
};

/**
 * Retrieves top contributors ranked by total XP for community leaderboard.
 */
export const getContributorLeaderboardFromDB = async (
  limit = 10,
): Promise<DatabaseQueryResponseType> => {
  try {
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const topContributors = await Contributor.find({})
      .sort({ totalXp: -1, createdAt: 1 })
      .limit(safeLimit)
      .select("name avatar githubUsername role totalXp approvedCount isCaptain")
      .lean();

    return { data: topContributors };
  } catch (error) {
    logger.error("DB: getContributorLeaderboardFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed to fetch contributor leaderboard",
      details: error,
    };
  }
};

