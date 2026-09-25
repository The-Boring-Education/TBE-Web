import type { TBEAppType, UserPointsActionType } from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import { InterviewSheet, PeriodScore } from "../models";
import { getHiddenLearnerIds, getViewerStanding } from "./leaderboard";
import {
  type NotCountedReason,
  type PointEventResult,
  recordPointEvent,
} from "./pointLedger";

/** What the client toast needs after a learner acts. */
export interface GamificationSummary {
  pointsEarned: number;
  lifetimePoints: number;
  countedForLeaderboard: boolean;
  notCountedReason?: NotCountedReason;
  weekly: {
    score: number;
    rank: number | null;
    previousRank: number | null;
  };
}

/** Approximate Weekly rank before this event (strictly-higher scores only). */
const rankBefore = async (result: PointEventResult, userId: string) => {
  const before = result.periodScores.WEEKLY - result.periodScoreDelta;
  if (before <= 0) return null;
  const hidden = (await getHiddenLearnerIds()).filter(
    (id) => id.toString() !== userId,
  );
  const filter = {
    type: "WEEKLY",
    periodKey: result.periodKeys.WEEKLY,
    score: { $gt: before },
  };
  const [all, hiddenAhead] = await Promise.all([
    PeriodScore.countDocuments(filter),
    hidden.length
      ? PeriodScore.countDocuments({ ...filter, userId: { $in: hidden } })
      : Promise.resolve(0),
  ]);
  // The learner's own row is ahead of their old score after a gain.
  const selfAhead = result.periodScoreDelta > 0 ? 1 : 0;
  return Math.max(1, all - hiddenAhead - selfAhead + 1);
};

export const summarizePointEvent = async (
  result: PointEventResult,
  userId: string,
): Promise<GamificationSummary> => {
  let rank: number | null = null;
  let previousRank: number | null = null;
  if (result.periodScoreDelta !== 0) {
    const [standing, before] = await Promise.all([
      getViewerStanding("WEEKLY", result.periodKeys.WEEKLY, userId),
      rankBefore(result, userId),
    ]);
    rank = standing.rank;
    previousRank = before;
  }
  return {
    pointsEarned: result.pointsEarned,
    lifetimePoints: result.lifetimePoints,
    countedForLeaderboard: result.countedForLeaderboard,
    ...(result.notCountedReason
      ? { notCountedReason: result.notCountedReason }
      : {}),
    weekly: { score: result.periodScores.WEEKLY, rank, previousRank },
  };
};

/**
 * Award (or reverse) points for a verified action and summarise the outcome for
 * the response. Never throws: a gamification failure must not fail the learning
 * action itself.
 */
export const awardPoints = async ({
  isCompleted = true,
  userId,
  actionType,
  itemId,
  app,
}: {
  isCompleted?: boolean;
  userId: string;
  actionType: UserPointsActionType;
  itemId?: string;
  app?: TBEAppType;
}): Promise<GamificationSummary | undefined> => {
  try {
    const result = await recordPointEvent({
      userId,
      actionType,
      itemId,
      app,
      isReversal: !isCompleted,
    });
    return await summarizePointEvent(result, userId);
  } catch (error) {
    logger.error("awardPoints failed", {
      actionType,
      error: error instanceof Error ? error.message : String(error),
    });
    return undefined;
  }
};

/**
 * Award (or reverse) the COMPLETE_INTERVIEW_SHEET bonus only when a question toggle
 * finishes a sheet or un-finishes a complete one. The Ledger's per-item state makes
 * repeated calls harmless.
 */
export const awardSheetCompletion = async ({
  userId,
  sheetId,
  userSheet,
  isCompleted,
}: {
  userId: string;
  sheetId: string;
  userSheet?: { questions?: { isCompleted?: boolean }[] } | null;
  isCompleted: boolean;
}): Promise<GamificationSummary | undefined> => {
  try {
    const progress = userSheet?.questions ?? [];
    const incomplete = progress.filter((q) => !q.isCompleted).length;
    // Completing: every question is now done. Un-completing: this toggle broke a
    // sheet that was complete (exactly one question is now undone). Anything else
    // never earned — or never had — the bonus, so there is nothing to change.
    const crossesCompletion = isCompleted ? incomplete === 0 : incomplete === 1;
    if (progress.length === 0 || !crossesCompletion) return undefined;

    const sheet = await InterviewSheet.findById(sheetId, {
      questions: 1,
    }).lean();
    const total =
      (sheet as { questions?: unknown[] } | null)?.questions?.length ?? 0;
    if (total === 0 || progress.length < total) return undefined;

    return await awardPoints({
      isCompleted,
      userId,
      actionType: "COMPLETE_INTERVIEW_SHEET",
      itemId: String(sheetId),
    });
  } catch (error) {
    logger.error("awardSheetCompletion failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return undefined;
  }
};

/** Combine the summaries of actions triggered by one learner click (e.g. question + sheet bonus). */
export const mergeGamificationSummaries = (
  first?: GamificationSummary,
  second?: GamificationSummary,
): GamificationSummary | undefined => {
  if (!first || !second) return first ?? second;
  const weeklyMoved = second.weekly.rank !== null ? second : first;
  return {
    pointsEarned: first.pointsEarned + second.pointsEarned,
    lifetimePoints: second.lifetimePoints,
    countedForLeaderboard:
      first.countedForLeaderboard || second.countedForLeaderboard,
    ...(first.countedForLeaderboard || !first.notCountedReason
      ? {}
      : { notCountedReason: first.notCountedReason }),
    weekly: {
      score: second.weekly.score,
      rank: weeklyMoved.weekly.rank,
      previousRank: first.weekly.previousRank ?? second.weekly.previousRank,
    },
  };
};
