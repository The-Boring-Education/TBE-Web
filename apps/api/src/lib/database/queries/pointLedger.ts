/**
 * Point Ledger — the single entry point for awarding or reversing points.
 *
 * Owns (see CONTEXT.md / ADR-0001):
 *  - Lifetime Points (Gamification.points)
 *  - the append-only PointEvent log
 *  - per-item state via LearningCredit:
 *      `completed` — whether the learner currently has the item done; Lifetime
 *                    Points only move when it flips, so repeats are free.
 *      `credited`  — whether the item currently counts toward Period Score.
 *  - the Pace Limit for BASE Learning Actions
 *  - live PeriodScore counters for the current DAILY / WEEKLY / MONTHLY Periods
 *
 * All writes for one event commit together in a MongoDB transaction (plain writes
 * on a standalone server, e.g. local dev). DB cost per Learning Action is bounded:
 * credit read + upsert, lifetime update, pace update (BASE only), one bulkWrite
 * for the three counters, one event insert and one read.
 */
import {
  classifyPointAction,
  LEADERBOARD_PACE_LIMIT_MS,
  LEADERBOARD_PERIOD_TYPES,
} from "@tbe/constants";
import { getPeriodKeysAt } from "@tbe/utils/leaderboard";
import mongoose, { type ClientSession } from "mongoose";

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
  /** Signed change to Lifetime Points (0 when nothing changed, e.g. a repeat). */
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
const MAX_ATTEMPTS = 3;

const isDuplicateKeyError = (error: unknown) =>
  (error as { code?: unknown })?.code === DUPLICATE_KEY;

/** Standalone servers (local dev) reject transactions; fall back to plain writes there. */
const isTransactionUnsupported = (error: unknown) => {
  const { code, message } = (error ?? {}) as {
    code?: unknown;
    message?: unknown;
  };
  return (
    code === 20 ||
    code === 263 ||
    (typeof message === "string" &&
      /Transaction numbers are only allowed|replica set/i.test(message))
  );
};

let transactionsSupported = true;

const runAtomically = async <T>(
  work: (session?: ClientSession) => Promise<T>,
): Promise<T> => {
  if (!transactionsSupported) return work();
  const session = await mongoose.startSession();
  try {
    let result!: T;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } catch (error) {
    if (!isTransactionUnsupported(error)) throw error;
    transactionsSupported = false;
    logger.warn("PointLedger: transactions unsupported, using plain writes");
    return work();
  } finally {
    await session.endSession();
  }
};

const toObjectId = (userId: string) => {
  const clean = typeof userId === "string" ? userId.trim() : String(userId);
  if (!mongoose.isValidObjectId(clean)) {
    throw new Error("Invalid userId");
  }
  return new mongoose.Types.ObjectId(clean);
};

/** Claim the learner's Pace Limit slot; false when a BASE action counted too recently. */
const claimPaceSlot = async (
  userId: mongoose.Types.ObjectId,
  now: Date,
  session?: ClientSession,
) => {
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
    { session },
  );
  return result.modifiedCount === 1;
};

const applyLifetimePoints = async (
  userId: mongoose.Types.ObjectId,
  delta: number,
  session?: ClientSession,
) => {
  const update =
    delta >= 0
      ? { $inc: { points: delta } }
      : [
          {
            $set: {
              points: {
                $max: [{ $add: [{ $ifNull: ["$points", 0] }, delta] }, 0],
              },
            },
          },
        ];
  const doc = await Gamification.findOneAndUpdate({ userId }, update, {
    new: true,
    upsert: true,
    projection: { points: 1 },
    session,
  }).lean();
  return doc?.points ?? Math.max(delta, 0);
};

const applyPeriodScores = async (
  userId: mongoose.Types.ObjectId,
  periodKeys: Record<LeaderboardType, string>,
  delta: number,
  now: Date,
  session?: ClientSession,
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
    { ordered: true, session },
  );
};

const readPeriodScores = async (
  userId: mongoose.Types.ObjectId,
  periodKeys: Record<LeaderboardType, string>,
  session?: ClientSession,
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
    { session },
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

interface Resolution {
  /** Signed change to Lifetime Points. */
  lifetimeDelta: number;
  counted: boolean;
  reason?: NotCountedReason;
}

/**
 * Decide how this event moves Lifetime Points and Period Score, and persist the
 * per-item state that makes repeats and reversals idempotent.
 */
const resolveItemState = async (
  userId: mongoose.Types.ObjectId,
  input: RecordPointEventInput,
  points: number,
  now: Date,
  session?: ClientSession,
): Promise<Resolution> => {
  const actionClass = classifyPointAction(input.actionType);
  const signed = input.isReversal ? -points : points;

  if (actionClass === "ENGAGEMENT") {
    return { lifetimeDelta: signed, counted: false, reason: "ENGAGEMENT" };
  }
  if (!input.itemId) {
    logger.warn("PointLedger: learning action without itemId", {
      actionType: input.actionType,
    });
    return { lifetimeDelta: signed, counted: false, reason: "MISSING_ITEM" };
  }

  const key = { userId, actionType: input.actionType, itemId: input.itemId };
  const row = await LearningCredit.findOne(key, null, { session }).lean();
  const save = (fields: { completed: boolean; credited: boolean }) =>
    LearningCredit.updateOne(
      key,
      { $set: { ...fields, ...(fields.credited ? { creditedAt: now } : {}) } },
      { upsert: true, session },
    );

  if (!input.isReversal) {
    // Already done and counted (retake, double click, repeated API call): nothing moves.
    if (row?.completed && row.credited) {
      return { lifetimeDelta: 0, counted: false, reason: "ALREADY_CREDITED" };
    }
    // New completion earns Lifetime Points; an item that was completed while the
    // Pace Limit was hit can still be counted on a later repeat, without
    // earning Lifetime Points twice.
    const lifetimeDelta = row?.completed ? 0 : points;
    const paceOk =
      actionClass === "BONUS" || (await claimPaceSlot(userId, now, session));
    await save({ completed: true, credited: paceOk });
    return paceOk
      ? { lifetimeDelta, counted: true }
      : { lifetimeDelta, counted: false, reason: "PACE_LIMIT" };
  }

  if (row?.completed) {
    await save({ completed: false, credited: false });
    return row.credited
      ? { lifetimeDelta: -points, counted: true }
      : { lifetimeDelta: -points, counted: false, reason: "NOT_CREDITED" };
  }
  if (!row) {
    // Completed before the ledger existed: take the legacy points back once,
    // and remember it so repeated reversals are no-ops.
    await save({ completed: false, credited: false });
    return { lifetimeDelta: -points, counted: false, reason: "NOT_CREDITED" };
  }
  return { lifetimeDelta: 0, counted: false, reason: "NOT_CREDITED" };
};

const recordOnce = async (
  userId: mongoose.Types.ObjectId,
  input: RecordPointEventInput,
  points: number,
  now: Date,
  session?: ClientSession,
): Promise<PointEventResult> => {
  // Make sure the learner's gamification doc exists for the pace check.
  await Gamification.updateOne(
    { userId },
    { $setOnInsert: { points: 0 } },
    { upsert: true, session },
  );

  const { lifetimeDelta, counted, reason } = await resolveItemState(
    userId,
    input,
    points,
    now,
    session,
  );
  const periodKeys = getPeriodKeysAt(now);
  const periodScoreDelta = counted ? (input.isReversal ? -points : points) : 0;

  const lifetimePoints = await applyLifetimePoints(
    userId,
    lifetimeDelta,
    session,
  );
  if (counted) {
    await applyPeriodScores(userId, periodKeys, periodScoreDelta, now, session);
  }
  await PointEvent.create(
    [
      {
        userId,
        actionType: input.actionType,
        points: lifetimeDelta,
        itemId: input.itemId,
        app: input.app,
        countedForLeaderboard: counted,
      },
    ],
    { session },
  );
  const periodScores = await readPeriodScores(userId, periodKeys, session);

  return {
    pointsEarned: lifetimeDelta,
    lifetimePoints,
    countedForLeaderboard: counted,
    ...(reason ? { notCountedReason: reason } : {}),
    periodScoreDelta,
    periodKeys,
    periodScores,
  };
};

export const recordPointEvent = async (
  input: RecordPointEventInput,
): Promise<PointEventResult> => {
  const now = input.now ?? new Date();
  const userId = toObjectId(input.userId);
  const points = calculateUserPointsForAction(input.actionType);
  if (!points) {
    throw new Error(`Unknown point action: ${String(input.actionType)}`);
  }

  for (let attempt = 1; ; attempt++) {
    try {
      return await runAtomically((session) =>
        recordOnce(userId, input, points, now, session),
      );
    } catch (error) {
      // A concurrent first write to the same unique row: retry and read the winner's state.
      if (!isDuplicateKeyError(error) || attempt >= MAX_ATTEMPTS) throw error;
    }
  }
};
