/**
 * Period Close — freezes Champions and notifies top finishers when a Period ends.
 *
 * Idempotent: one PeriodClose record per (type, periodKey). The standings are frozen
 * on first close and each recipient is marked as notified individually, so retries
 * only email learners who haven't been sent to yet.
 */
import {
  LEADERBOARD_EMAIL_RECIPIENTS,
  LEADERBOARD_LIMITS,
} from "@tbe/constants";
import { hasPeriodEnded, isValidPeriodKey } from "@tbe/utils/leaderboard";
import mongoose from "mongoose";

import type { LeaderboardType } from "@/lib/interfaces";
import type { LeaderboardEmailRecipient } from "@/lib/services/leaderboardEmail";
import { logger } from "@/lib/utils/logger";

import { PeriodClose, User } from "../models";
import { getLeaderboardBoard, periodFilter } from "./leaderboard";

export type NotifyTopFinisher = (
  type: LeaderboardType,
  recipient: LeaderboardEmailRecipient,
) => Promise<boolean>;

export interface ClosePeriodResult {
  type: LeaderboardType;
  periodKey: string;
  alreadyClosed: boolean;
  champions: { userId: string; rank: number; score: number }[];
  sent: number;
  skipped: number;
  failed: number;
}

export class PeriodCloseError extends Error {
  constructor(
    message: string,
    public readonly code: "INVALID_PERIOD" | "PERIOD_NOT_ENDED",
  ) {
    super(message);
  }
}

const DUPLICATE_KEY = 11000;

const freezeStandings = async (
  type: LeaderboardType,
  periodKey: string,
  now: Date,
) => {
  const existing = await PeriodClose.findOne(
    periodFilter(type, periodKey),
  ).lean();
  if (existing) return { record: existing, alreadyClosed: true };

  const size = Math.max(
    LEADERBOARD_EMAIL_RECIPIENTS[type],
    LEADERBOARD_LIMITS.CHAMPIONS,
  );
  const board = await getLeaderboardBoard({
    type,
    periodKey,
    limit: size,
    audience: "member",
    now,
  });
  const standings = board.entries.map((e) => ({
    userId: new mongoose.Types.ObjectId(e.userId),
    rank: e.rank,
    score: e.score,
  }));

  try {
    const created = await PeriodClose.create({
      type,
      periodKey,
      champions: standings.slice(0, LEADERBOARD_LIMITS.CHAMPIONS),
      standings,
      notified: [],
      closedAt: now,
    });
    return { record: created.toObject(), alreadyClosed: false };
  } catch (error) {
    // A concurrent close won the race — use its frozen standings.
    if ((error as { code?: number })?.code === DUPLICATE_KEY) {
      const record = await PeriodClose.findOne(
        periodFilter(type, periodKey),
      ).lean();
      if (record) return { record, alreadyClosed: true };
    }
    throw error;
  }
};

export const closePeriod = async ({
  type,
  periodKey,
  notify,
  now = new Date(),
}: {
  type: LeaderboardType;
  periodKey: string;
  notify: NotifyTopFinisher;
  now?: Date;
}): Promise<ClosePeriodResult> => {
  if (!isValidPeriodKey(type, periodKey)) {
    throw new PeriodCloseError(`Invalid ${type} period key`, "INVALID_PERIOD");
  }
  if (!hasPeriodEnded(type, periodKey, now)) {
    throw new PeriodCloseError(
      `${type} period ${periodKey} has not ended yet`,
      "PERIOD_NOT_ENDED",
    );
  }

  const { record, alreadyClosed } = await freezeStandings(type, periodKey, now);
  const recipients = (record.standings ?? []).slice(
    0,
    LEADERBOARD_EMAIL_RECIPIENTS[type],
  );
  const alreadyNotified = new Set(
    (record.notified ?? []).map((n) => n.userId.toString()),
  );
  const pending = recipients.filter(
    (r) => !alreadyNotified.has(r.userId.toString()),
  );

  const learners = await User.find(
    { _id: { $in: pending.map((p) => p.userId) } },
    { name: 1, email: 1, leaderboard: 1 },
  ).lean();
  const byId = new Map(learners.map((l) => [String(l._id), l]));

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const standing of pending) {
    const learner = byId.get(standing.userId.toString());
    if (
      !learner?.email ||
      learner.leaderboard?.emails === false ||
      learner.leaderboard?.excluded === true
    ) {
      skipped++;
      continue;
    }
    // Claim the recipient atomically *before* sending, so overlapping close runs
    // (cron + manual, HTTP retries) can never both email the same learner. If a
    // process dies between claim and send the email is skipped, never duplicated.
    const claim = await PeriodClose.updateOne(
      { _id: record._id, "notified.userId": { $ne: standing.userId } },
      {
        $push: {
          notified: {
            userId: standing.userId,
            rank: standing.rank,
            claimedAt: new Date(),
          },
        },
      },
    );
    if (claim.modifiedCount !== 1) continue; // another run owns this recipient

    const release = () =>
      PeriodClose.updateOne(
        { _id: record._id },
        { $pull: { notified: { userId: standing.userId, sentAt: null } } },
      );

    try {
      const ok = await notify(type, {
        userId: standing.userId.toString(),
        email: learner.email,
        name: learner.name,
        rank: standing.rank,
        score: standing.score ?? 0,
      });
      if (!ok) {
        failed++;
        await release(); // let a retry try again
        continue;
      }
      await PeriodClose.updateOne(
        { _id: record._id, "notified.userId": standing.userId },
        { $set: { "notified.$.sentAt": new Date() } },
      );
      sent++;
    } catch (error) {
      failed++;
      await release();
      logger.error("PeriodClose: notify failed", {
        type,
        periodKey,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    type,
    periodKey,
    alreadyClosed,
    champions: (record.champions ?? []).map((c) => ({
      userId: c.userId.toString(),
      rank: c.rank,
      score: c.score,
    })),
    sent,
    skipped,
    failed,
  };
};
