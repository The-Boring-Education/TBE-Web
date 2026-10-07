/**
 * Leaderboard Reader — ranks learners by live Period Score (ADR-0001).
 *
 * Every read is index-backed on { type, periodKey, score desc, reachedAt asc }.
 * Hidden and excluded learners (Leaderboard Visibility / Exclusion) are filtered
 * for member and public audiences; admins see everyone.
 */
import { LEADERBOARD_LIMITS, LEADERBOARD_PERIOD_TYPES } from "@tbe/constants";
import {
  getPeriodKey,
  getPeriodResetsAt,
  getPreviousPeriodKey,
  isValidPeriodKey,
  maskLearnerName,
} from "@tbe/utils/leaderboard";
import mongoose from "mongoose";

import type { LeaderboardType } from "@/lib/interfaces";

import { PeriodClose, PeriodScore, User } from "../models";

export type LeaderboardAudience = "member" | "public" | "admin";

export interface LeaderboardEntryView {
  rank: number;
  userId?: string;
  displayName: string;
  image?: string;
  score: number;
  /** Admin audience only. */
  hidden?: boolean;
  excluded?: boolean;
}

export interface ViewerStanding {
  rank: number | null;
  score: number;
  nextTarget: { displayName: string; gap: number; rank: number } | null;
}

export interface LeaderboardBoard {
  type: LeaderboardType;
  periodKey: string;
  resetsAt: string;
  totalLearners: number;
  entries: LeaderboardEntryView[];
  viewer?: ViewerStanding;
}

interface ScoreRow {
  userId: mongoose.Types.ObjectId;
  score: number;
  reachedAt: Date;
}

interface LearnerRow {
  _id: mongoose.Types.ObjectId;
  name?: string;
  image?: string;
  leaderboard?: { visible?: boolean; excluded?: boolean };
}

const HIDDEN_CACHE_TTL_MS = 30_000;
let hiddenCache: { at: number; ids: mongoose.Types.ObjectId[] } | null = null;

/** Learners hidden from others: visibility off or excluded. Small set, briefly memoised. */
export const getHiddenLearnerIds = async (fresh = false) => {
  if (
    !fresh &&
    hiddenCache &&
    Date.now() - hiddenCache.at < HIDDEN_CACHE_TTL_MS
  ) {
    return hiddenCache.ids;
  }
  const rows = await User.find(
    {
      $or: [{ "leaderboard.visible": false }, { "leaderboard.excluded": true }],
    },
    { _id: 1 },
  ).lean();
  const ids = rows.map((r) => r._id as mongoose.Types.ObjectId);
  hiddenCache = { at: Date.now(), ids };
  return ids;
};

export const invalidateHiddenLearnerCache = () => {
  hiddenCache = null;
};

/**
 * `{ type, periodKey }` filter built only from validated values: the type comes
 * from the constant allow-list and both are matched with `$eq`, so request input
 * can never become a query operator.
 */
export const periodFilter = (type: LeaderboardType, periodKey: string) => {
  const safeType = LEADERBOARD_PERIOD_TYPES.find((t) => t === type);
  if (!safeType || !isValidPeriodKey(safeType, periodKey)) {
    throw new Error(`Invalid ${String(type)} period key`);
  }
  return {
    type: { $eq: safeType },
    periodKey: { $eq: String(periodKey) },
  };
};

const isHidden = (learner?: LearnerRow) =>
  learner?.leaderboard?.visible === false ||
  learner?.leaderboard?.excluded === true;

const aheadOf = (row: { score: number; reachedAt: Date }) => ({
  $or: [
    { score: { $gt: row.score } },
    { score: row.score, reachedAt: { $lt: row.reachedAt } },
  ],
});

export const resolvePeriodKey = (
  type: LeaderboardType,
  periodKey: unknown,
  now: Date,
) => {
  if (periodKey === undefined || periodKey === null || periodKey === "") {
    return getPeriodKey(type, now);
  }
  return isValidPeriodKey(type, periodKey) ? (periodKey as string) : null;
};

const toEntry = (
  row: ScoreRow,
  learner: LearnerRow | undefined,
  rank: number,
  audience: LeaderboardAudience,
): LeaderboardEntryView => {
  const name = learner?.name ?? "";
  if (audience === "public") {
    return {
      rank,
      displayName: maskLearnerName(name),
      image: learner?.image,
      score: row.score,
    };
  }
  return {
    rank,
    userId: row.userId.toString(),
    displayName: name || "TBE Learner",
    image: learner?.image,
    score: row.score,
    ...(audience === "admin"
      ? {
          hidden: learner?.leaderboard?.visible === false,
          excluded: learner?.leaderboard?.excluded === true,
        }
      : {}),
  };
};

/**
 * Top `limit` learners for a Period. Over-fetches in bounded batches so that
 * hidden learners never leave the board short.
 */
const getTopEntries = async (
  type: LeaderboardType,
  periodKey: string,
  limit: number,
  audience: LeaderboardAudience,
) => {
  const entries: LeaderboardEntryView[] = [];
  const batchSize = Math.max(limit * 2, 20);
  const maxBatches = 5;
  let skip = 0;

  for (let batch = 0; batch < maxBatches && entries.length < limit; batch++) {
    const rows = (await PeriodScore.find(
      { ...periodFilter(type, periodKey), score: { $gt: 0 } },
      { userId: 1, score: 1, reachedAt: 1 },
    )
      .sort({ score: -1, reachedAt: 1 })
      .skip(skip)
      .limit(batchSize)
      .lean()) as ScoreRow[];
    if (rows.length === 0) break;
    skip += rows.length;

    const learners = (await User.find(
      { _id: { $in: rows.map((r) => r.userId) } },
      { name: 1, image: 1, leaderboard: 1 },
    ).lean()) as LearnerRow[];
    const byId = new Map(learners.map((l) => [l._id.toString(), l]));

    for (const row of rows) {
      const learner = byId.get(row.userId.toString());
      if (!learner) continue; // deleted account
      if (audience !== "admin" && isHidden(learner)) continue;
      entries.push(toEntry(row, learner, entries.length + 1, audience));
      if (entries.length >= limit) break;
    }
    if (rows.length < batchSize) break;
  }
  return entries;
};

/**
 * A learner's own standing among Visible Learners. Works for hidden learners too
 * (they see where they would rank). Rank is null when Period Score ≤ 0.
 */
export const getViewerStanding = async (
  type: LeaderboardType,
  periodKey: string,
  viewerId: string,
): Promise<ViewerStanding> => {
  if (!mongoose.isValidObjectId(viewerId)) {
    return { rank: null, score: 0, nextTarget: null };
  }
  const userId = new mongoose.Types.ObjectId(viewerId);
  const period = periodFilter(type, periodKey);
  const mine = (await PeriodScore.findOne(
    { ...period, userId: { $eq: userId } },
    { score: 1, reachedAt: 1, userId: 1 },
  ).lean()) as ScoreRow | null;

  if (!mine || mine.score <= 0) {
    return { rank: null, score: 0, nextTarget: null };
  }

  const hiddenIds = await getHiddenLearnerIds();
  const others = hiddenIds.filter((id) => !id.equals(userId));
  const base = { ...period, ...aheadOf(mine) };

  const [aheadAll, aheadHidden, nextRow] = await Promise.all([
    PeriodScore.countDocuments(base),
    others.length
      ? PeriodScore.countDocuments({ ...base, userId: { $in: others } })
      : Promise.resolve(0),
    PeriodScore.findOne(
      { ...base, userId: { $nin: others } },
      { userId: 1, score: 1, reachedAt: 1 },
    )
      .sort({ score: 1, reachedAt: -1 })
      .lean() as Promise<ScoreRow | null>,
  ]);

  const rank = aheadAll - aheadHidden + 1;
  let nextTarget: ViewerStanding["nextTarget"] = null;
  if (nextRow) {
    const learner = (await User.findById(nextRow.userId, {
      name: 1,
    }).lean()) as LearnerRow | null;
    nextTarget = {
      displayName: learner?.name || "TBE Learner",
      gap: nextRow.score - mine.score + 1,
      rank: rank - 1,
    };
  }
  return { rank, score: mine.score, nextTarget };
};

/** Learners with a positive Period Score; hidden/excluded ones only count for admins. */
const countRankedLearners = async (
  type: LeaderboardType,
  periodKey: string,
  audience: LeaderboardAudience,
) => {
  const filter = { ...periodFilter(type, periodKey), score: { $gt: 0 } };
  if (audience === "admin") return PeriodScore.countDocuments(filter);
  const hiddenIds = await getHiddenLearnerIds();
  return PeriodScore.countDocuments(
    hiddenIds.length ? { ...filter, userId: { $nin: hiddenIds } } : filter,
  );
};

export const getLeaderboardBoard = async ({
  type,
  periodKey,
  limit = LEADERBOARD_LIMITS.DASHBOARD,
  viewerId,
  audience = "member",
  now = new Date(),
}: {
  type: LeaderboardType;
  periodKey?: string;
  limit?: number;
  viewerId?: string;
  audience?: LeaderboardAudience;
  now?: Date;
}): Promise<LeaderboardBoard> => {
  const key = periodKey ?? getPeriodKey(type, now);
  const safeLimit = Math.min(
    Math.max(1, Math.floor(limit) || 1),
    LEADERBOARD_LIMITS.MAX,
  );

  const [entries, totalLearners, viewer] = await Promise.all([
    getTopEntries(type, key, safeLimit, audience),
    countRankedLearners(type, key, audience),
    viewerId && audience !== "public"
      ? getViewerStanding(type, key, viewerId)
      : Promise.resolve(undefined),
  ]);

  const isCurrent = key === getPeriodKey(type, now);
  return {
    type,
    periodKey: key,
    resetsAt: (isCurrent ? getPeriodResetsAt(type, now) : now).toISOString(),
    totalLearners,
    entries,
    ...(viewer ? { viewer } : {}),
  };
};

export interface ChampionView {
  rank: number;
  /** Omitted for the public audience. */
  userId?: string;
  displayName: string;
  image?: string;
  score: number;
}

export interface PeriodChampions {
  type: LeaderboardType;
  periodKey: string;
  closedAt: string;
  champions: ChampionView[];
}

/**
 * Frozen Champions of a closed Period (defaults to the one just before `now`).
 * The ranking stays frozen, but learners who are hidden or excluded *now* are
 * left out for member/public viewers; the public audience also gets masked
 * names and no user ids.
 */
export const getPeriodChampions = async (
  type: LeaderboardType,
  periodKey?: string,
  now = new Date(),
  audience: LeaderboardAudience = "member",
): Promise<PeriodChampions | null> => {
  const key = periodKey ?? getPreviousPeriodKey(type, now);
  const record = await PeriodClose.findOne(periodFilter(type, key), {
    champions: 1,
    closedAt: 1,
    periodKey: 1,
  }).lean();
  if (!record) return null;

  const learners = (await User.find(
    { _id: { $in: record.champions.map((c) => c.userId) } },
    { name: 1, image: 1, leaderboard: 1 },
  ).lean()) as LearnerRow[];
  const byId = new Map(learners.map((l) => [l._id.toString(), l]));

  const champions: ChampionView[] = [];
  for (const c of record.champions) {
    const learner = byId.get(c.userId.toString());
    if (audience !== "admin" && (!learner || isHidden(learner))) continue;
    const name = learner?.name ?? "";
    champions.push(
      audience === "public"
        ? {
            rank: c.rank,
            displayName: maskLearnerName(name),
            image: learner?.image,
            score: c.score,
          }
        : {
            rank: c.rank,
            userId: c.userId.toString(),
            displayName: name || "TBE Learner",
            image: learner?.image,
            score: c.score,
          },
    );
  }

  return {
    type,
    periodKey: key,
    closedAt: new Date(record.closedAt).toISOString(),
    champions,
  };
};

/** Recent Period Close records, newest first, for admin history (unfiltered). */
export const getChampionHistory = async (type: LeaderboardType, limit = 12) => {
  const safeType = LEADERBOARD_PERIOD_TYPES.find((t) => t === type);
  if (!safeType) return [];
  const records = await PeriodClose.find(
    { type: { $eq: safeType } },
    { periodKey: 1 },
  )
    .sort({ periodKey: -1 })
    .limit(Math.min(limit, 52))
    .lean();
  const out: PeriodChampions[] = [];
  for (const r of records) {
    const champions = await getPeriodChampions(
      safeType,
      r.periodKey,
      undefined,
      "admin",
    );
    if (champions) out.push(champions);
  }
  return out;
};

/** Champion Badges: Weekly and Monthly Champion counts for one learner. */
export const getChampionBadgeCounts = async (userId: string) => {
  const counts = { WEEKLY: 0, MONTHLY: 0 };
  if (!mongoose.isValidObjectId(userId)) return counts;
  const id = new mongoose.Types.ObjectId(userId);
  const rows = await PeriodClose.aggregate<{
    _id: "WEEKLY" | "MONTHLY";
    n: number;
  }>([
    {
      $match: { type: { $in: ["WEEKLY", "MONTHLY"] }, "champions.userId": id },
    },
    { $group: { _id: "$type", n: { $sum: 1 } } },
  ]);
  for (const row of rows) counts[row._id] = row.n;
  return counts;
};
