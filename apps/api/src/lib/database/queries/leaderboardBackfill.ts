/**
 * One-off backfill of Period Scores for the Periods in progress at launch, from
 * legacy `Gamification.actions[]` (ADR-0001). Legacy actions carry no Learning
 * Item id, so they cannot be de-duplicated — accepted for in-flight Periods only.
 *
 * Idempotent: each counter remembers the amount it was backfilled with and a
 * re-run replaces that amount instead of adding to it.
 */
import {
  isLearningAction,
  LEADERBOARD_PERIOD_TYPES,
  POINT_ACTION_CLASS,
} from "@tbe/constants";
import { getPeriodBounds, getPeriodKeysAt } from "@tbe/utils/leaderboard";
import type mongoose from "mongoose";

import type { LeaderboardType } from "@/lib/interfaces";

import { Gamification, PeriodScore } from "../models";

interface LegacyActionRow {
  userId: mongoose.Types.ObjectId;
  actionType: string;
  points: number;
  at: Date;
}

export interface BackfillResult {
  periodKeys: Record<LeaderboardType, string>;
  learners: number;
  counters: number;
}

const BATCH_SIZE = 500;

export const backfillCurrentPeriodScores = async ({
  now = new Date(),
  dryRun = false,
}: { now?: Date; dryRun?: boolean } = {}): Promise<BackfillResult> => {
  const periodKeys = getPeriodKeysAt(now);
  const starts = LEADERBOARD_PERIOD_TYPES.map((type) => ({
    type,
    start: getPeriodBounds(type, periodKeys[type]).start,
  }));
  const earliest = new Date(
    Math.min(...starts.map((s) => s.start.getTime())),
  );
  const learningTypes = Object.keys(POINT_ACTION_CLASS).filter((t) =>
    isLearningAction(t),
  );

  const rows = await Gamification.aggregate<LegacyActionRow>([
    { $match: { "actions.createdAt": { $gte: earliest } } },
    { $unwind: "$actions" },
    {
      $match: {
        "actions.createdAt": { $gte: earliest, $lt: now },
        "actions.actionType": { $in: learningTypes },
      },
    },
    {
      $project: {
        _id: 0,
        userId: 1,
        actionType: "$actions.actionType",
        points: "$actions.pointsEarned",
        at: "$actions.createdAt",
      },
    },
  ]);

  const totals = new Map<
    string,
    { type: LeaderboardType; userId: mongoose.Types.ObjectId; total: number; lastAt: Date }
  >();
  for (const row of rows) {
    for (const { type, start } of starts) {
      if (row.at < start) continue;
      const key = `${type}:${row.userId.toString()}`;
      const entry = totals.get(key) ?? {
        type,
        userId: row.userId,
        total: 0,
        lastAt: row.at,
      };
      entry.total += row.points || 0;
      if (row.at > entry.lastAt) entry.lastAt = row.at;
      totals.set(key, entry);
    }
  }

  const ops = [...totals.values()]
    .filter((t) => t.total > 0)
    .map((t) => ({
      updateOne: {
        filter: { type: t.type, periodKey: periodKeys[t.type], userId: t.userId },
        update: [
          {
            $set: {
              score: {
                $add: [
                  {
                    $subtract: [
                      { $ifNull: ["$score", 0] },
                      { $ifNull: ["$backfilled", 0] },
                    ],
                  },
                  t.total,
                ],
              },
              backfilled: t.total,
              reachedAt: { $ifNull: ["$reachedAt", t.lastAt] },
            },
          },
        ],
        upsert: true,
      },
    }));

  if (!dryRun) {
    for (let i = 0; i < ops.length; i += BATCH_SIZE) {
      await PeriodScore.bulkWrite(ops.slice(i, i + BATCH_SIZE), {
        ordered: false,
      });
    }
  }

  return {
    periodKeys,
    learners: new Set([...totals.values()].map((t) => t.userId.toString())).size,
    counters: ops.length,
  };
};
