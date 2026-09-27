import mongoose from "mongoose";

import type {
  DatabaseQueryResponseType,
  TBEAppType,
  UserPointsActionType,
} from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import { Gamification, UserActivityLog } from "../models";
import { recordPointEvent } from "./pointLedger";

const getMongoUserId = (userId: string) => {
  const cleanId = typeof userId === "string" ? userId.trim() : String(userId);
  if (!mongoose.isValidObjectId(cleanId)) {
    throw new Error("Invalid userId");
  }
  return new mongoose.Types.ObjectId(cleanId);
};

const addGamificationDocInDB = async (
  userId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const gamification = new Gamification({ userId: getMongoUserId(userId) });
    await gamification.save();
    const doc = gamification.toObject();
    const { actions: _actions, ...data } = doc;
    return { data };
  } catch (error) {
    logger.error("DB: addGamificationDocInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to add gamification document", details: error };
  }
};

const getUserPointsFromDB = async (
  userId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const filterId = getMongoUserId(userId);
    const gamification = await Gamification.findOne({
      userId: { $eq: filterId },
    })
      .select("-actions")
      .lean();

    if (!gamification) {
      return { error: "User not found" };
    }

    return { data: gamification };
  } catch (error) {
    logger.error("DB: getUserPointsFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Error fetching user points", details: error };
  }
};

export interface AwardPointsOptions {
  app?: TBEAppType;
  /** The Learning Item this action is about — required for it to count toward Period Score. */
  itemId?: string;
}

/**
 * Award points for an action. Thin wrapper over the Point Ledger kept for existing callers.
 */
const updateUserPointsInDB = async (
  userId: string,
  actionType: UserPointsActionType,
  options: AwardPointsOptions = {},
): Promise<DatabaseQueryResponseType> => {
  try {
    const data = await recordPointEvent({
      userId,
      actionType,
      itemId: options.itemId,
      app: options.app,
    });

    // Log activity for streak tracking (intentionally unawaited, best-effort)
    if (options.app) {
      void logUserActivityForStreak(userId, options.app, actionType).catch(
        (err) => {
          logger.error("DB: logUserActivityForStreak failed silently", {
            error: err instanceof Error ? err.message : String(err),
          });
        },
      );
    }

    return { data };
  } catch (error) {
    logger.error("DB: updateUserPointsInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Error updating user points", details: error };
  }
};

/**
 * Records a single activity entry in UserActivityLog for streak tracking.
 * Silently skips duplicates for the same (userId, app, date) tuple.
 */
const logUserActivityForStreak = async (
  userId: string,
  app: TBEAppType,
  actionType: UserPointsActionType,
  metadata?: Record<string, unknown>,
): Promise<DatabaseQueryResponseType> => {
  try {
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    await UserActivityLog.create({ userId, app, actionType, date, metadata });
    return { data: { logged: true } };
  } catch (error: unknown) {
    const isDuplicateKey =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: unknown }).code === 11000;

    // Ignore duplicate key errors (11000) – this entry was already logged today
    if (!isDuplicateKey) {
      logger.error("DB: logUserActivityForStreak failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return { error: "Failed to log activity" };
  }
};

/**
 * Award (isCompleted) or reverse (!isCompleted) an action through the Point Ledger.
 * Reversals are recorded as negative Point Events and never drop Lifetime Points below 0.
 */
const handleGamificationPoints = async (
  isCompleted: boolean,
  userId: string,
  actionType: UserPointsActionType,
  options: AwardPointsOptions = {},
): Promise<DatabaseQueryResponseType> => {
  try {
    if (isCompleted) {
      const { data, error } = await updateUserPointsInDB(
        userId,
        actionType,
        options,
      );
      return error ? { error: "Gamification action failed" } : { data };
    }

    const data = await recordPointEvent({
      userId,
      actionType,
      itemId: options.itemId,
      app: options.app,
      isReversal: true,
    });
    return { data };
  } catch (error) {
    logger.error("DB: handleGamificationPoints failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Unexpected error in handleGamificationPoints",
      details: error,
    };
  }
};

export {
  addGamificationDocInDB,
  getUserPointsFromDB,
  handleGamificationPoints,
  logUserActivityForStreak,
  updateUserPointsInDB,
};
