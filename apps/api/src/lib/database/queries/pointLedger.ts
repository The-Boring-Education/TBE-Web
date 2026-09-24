/**
 * Point Ledger — the single entry point for awarding or reversing points.
 *
 * Owns (see CONTEXT.md / ADR-0001):
 *  - Lifetime Points (Gamification.points)
 *  - the append-only PointEvent log
 *  - "at most once per Learning Item" via LearningCredit
 *  - the Pace Limit for BASE Learning Actions
 *  - live PeriodScore counters for the current DAILY / WEEKLY / MONTHLY Periods
 *
 * DB cost per Learning Action is bounded: credit upsert, lifetime $inc, pace update
 * (BASE only), one bulkWrite for the three counters, one event insert and one read.
 */
import {
  classifyPointAction,
  LEADERBOARD_PACE_LIMIT_MS,
  LEADERBOARD_PERIOD_TYPES,
} from "@tbe/constants";
import { getPeriodKeysAt } from "@tbe/utils/leaderboard";
import mongoose from "mongoose";

import type {
  LeaderboardType,
  TBEAppType,
  UserPointsActionType,
} from "@/lib/interfaces";
import { calculateUserPointsForAction } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";

import {
  Gamification,
  LearningCredit,
  PeriodScore,
  PointEvent,
} from "../models";

export type NotCountedReason =
  | "ENGAGEMENT"
  | "MISSING_ITEM"
  | "ALREADY_CREDITED"
  | "NOT_CREDITED"
  | "PACE_LIMIT";

export interface RecordPointEventInput {
  userId: string;
  actionType: UserPointsActionType;
  /** Required for Learning Actions: the Learning Item (chapter, question, quiz…) id. */
  itemId?: string;
  app?: TBEAppType;
  /** True when the learner undid the action (e.g. un-completed a question). */
  isReversal?: boolean;
  now?: Date;
}

export interface PointEventResult {
  /** Signed change to Lifetime Points. */
  pointsEarned: number;
  lifetimePoints: number;
  countedForLeaderboard: boolean;
  notCountedReason?: NotCountedReason;
  /** Signed change applied to each current Period Score (0 when not counted). */
  periodScoreDelta: number;
  periodKeys: Record<LeaderboardType, string>;
  periodScores: Record<LeaderboardType, number>;
}

const DUPLICATE_KEY = 11000;

const isDuplicateKeyError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code: unknown }).code === DUPLICATE_KEY;

const toObjectId = (userId: string) => {
  const clean = typeof userId === "string" ? userId.trim() : String(userId);
  if (!mongoose.isValidObjectId(clean)) {
    throw new Error("Invalid userId");
  }
  return new mongoose.Types.ObjectId(clean);
};

/** Atomically mark an item credited. Returns false when it already was. */
const creditItem = async (
  userId: mongoose.Types.ObjectId,
  actionType: UserPointsActionType,
  itemId: string,
  now: Date,
) => {
  try {
    await LearningCredit.updateOne(
      { userId, actionType, itemId, credited: { $ne: true } },
      { $set: { credited: true, creditedAt: now } },
      { upsert: true },
    );
    return true;
  } catch (error) {
    // Upsert collides with the unique index when a credited doc already exists.
    if (isDuplicateKeyError(error)) return false;
    throw error;
  }
};

const uncreditItem = async (
  userId: mongoose.Types.ObjectId,
  actionType: UserPointsActionType,
  itemId: string,
) => {
  const result = await LearningCredit.updateOne(
    { userId, actionType, itemId, credited: true },
    { $set: { credited: false } },
  );
  return result.modifiedCount === 1;
};

/** Claim the learner's Pace Limit slot; false when a BASE action counted too recently. */
const claimPaceSlot = async (userId: mongoose.Types.ObjectId, now: Date) => {
  const threshold = new Date(now.getTime() - LEADERBOARD_PACE_LIMIT_MS);
  const result = await Gamification.updateOne(
    {
      userId,
      $or: [
        { lastBaseCountedAt: null },
        { lastBaseCountedAt: { $exists: false } },
        { lastBaseCountedAt: { $lte: threshold } },
      ],
    },
    { $set: { lastBaseCountedAt: now } },
  );
  return result.modifiedCount === 1;
};

const applyLifetimePoints = async (
  userId: mongoose.Types.ObjectId,
  delta: number,
) => {
  if (delta >= 0) {
    const doc = await Gamification.findOneAndUpdate(
      { userId },
      { $inc: { points: delta } },
      { new: true, upsert: true, projection: { points: 1 } },
    ).lean();
    return doc?.points ?? delta;
  }
  const doc = await Gamification.findOneAndUpdate(
    { userId },
    [{ $set: { points: { $max: [{ $add: ["$points", delta] }, 0] } } }],
    { new: true, projection: { points: 1 } },
  ).lean();
  return doc?.points ?? 0;
};

const applyPeriodScores = async (
  userId: mongoose.Types.ObjectId,
  periodKeys: Record<LeaderboardType, string>,
  delta: number,
  now: Date,
) => {
  await PeriodScore.bulkWrite(
    LEADERBOARD_PERIOD_TYPES.map((type) => ({
      updateOne: {
        filter: { type, periodKey: periodKeys[type], userId },
        update: {
          $inc: { score: delta },
          // Only gaining points moves the tie-break timestamp.
          ...(delta > 0
            ? { $set: { reachedAt: now } }
            : { $setOnInsert: { reachedAt: now } }),
        },
        upsert: true,
      },
    })),
    { ordered: false },
  );
};

const readPeriodScores = async (
  userId: mongoose.Types.ObjectId,
  periodKeys: Record<LeaderboardType, string>,
) => {
  const docs = await PeriodScore.find(
    {
      userId,
      $or: LEADERBOARD_PERIOD_TYPES.map((type) => ({
        type,
        periodKey: periodKeys[type],
      })),
    },
    { type: 1, score: 1 },
  ).lean();
  const scores: Record<LeaderboardType, number> = {
    DAILY: 0,
    WEEKLY: 0,
    MONTHLY: 0,
  };
  for (const doc of docs) {
    scores[doc.type as LeaderboardType] = Math.max(0, doc.score);
  }
  return scores;
};

/**
 * Decide whether this event moves Period Score, applying once-per-item and the Pace Limit.
 * Side effects are limited to LearningCredit and the pace timestamp.
 */
const resolveLeaderboardCredit = async (
  userId: mongoose.Types.ObjectId,
  input: RecordPointEventInput,
  now: Date,
): Promise<{ counted: boolean; reason?: NotCountedReason }> => {
  const actionClass = classifyPointAction(input.actionType);
  if (actionClass === "ENGAGEMENT") return { counted: false, reason: "ENGAGEMENT" };
  if (!input.itemId) {
    logger.warn("PointLedger: learning action without itemId", {
      actionType: input.actionType,
    });
    return { counted: false, reason: "MISSING_ITEM" };
  }

  if (input.isReversal) {
    const wasCredited = await uncreditItem(userId, input.actionType, input.itemId);
    return wasCredited
      ? { counted: true }
      : { counted: false, reason: "NOT_CREDITED" };
  }

  const credited = await creditItem(userId, input.actionType, input.itemId, now);
  if (!credited) return { counted: false, reason: "ALREADY_CREDITED" };

  if (actionClass === "BASE" && !(await claimPaceSlot(userId, now))) {
    // Release the credit so completing this item later can still count.
    await uncreditItem(userId, input.actionType, input.itemId);
    return { counted: false, reason: "PACE_LIMIT" };
  }
  return { counted: true };
};

export const recordPointEvent = async (
  input: RecordPointEventInput,
): Promise<PointEventResult> => {
  const now = input.now ?? new Date();
  const userId = toObjectId(input.userId);
  const basePoints = calculateUserPointsForAction(input.actionType);
  if (!basePoints) {
    throw new Error(`Unknown point action: ${String(input.actionType)}`);
  }
  const pointsEarned = input.isReversal ? -basePoints : basePoints;

  // Lifetime first: it also guarantees the Gamification doc exists for the pace check.
  const lifetimePoints = await applyLifetimePoints(userId, pointsEarned);

  const { counted, reason } = await resolveLeaderboardCredit(userId, input, now);
  const periodKeys = getPeriodKeysAt(now);
  const periodScoreDelta = counted ? pointsEarned : 0;

  if (counted) {
    await applyPeriodScores(userId, periodKeys, periodScoreDelta, now);
  }

  await PointEvent.create({
    userId,
    actionType: input.actionType,
    points: pointsEarned,
    itemId: input.itemId,
    app: input.app,
    countedForLeaderboard: counted,
  });

  const periodScores = await readPeriodScores(userId, periodKeys);

  return {
    pointsEarned,
    lifetimePoints,
    countedForLeaderboard: counted,
    ...(reason ? { notCountedReason: reason } : {}),
    periodScoreDelta,
    periodKeys,
    periodScores,
  };
};
