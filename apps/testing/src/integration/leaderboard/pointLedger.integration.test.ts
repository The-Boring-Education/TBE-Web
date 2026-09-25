/**
 * Point Ledger (integration, in-memory MongoDB): Lifetime Points, once-per-item
 * credit, reversals, the Pace Limit and live Period Score counters.
 */
import {
  Gamification,
  LearningCredit,
  PeriodScore,
  PointEvent,
} from "@api/lib/database/models";
import { recordPointEvent } from "@api/lib/database/queries/pointLedger";
import mongoose from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { clearCollections, ist, minutesLater, oid, startMongo } from "./mongo";

const MONDAY_NOON = ist("2026-09-21T12:00:00"); // week 2026-W39

const scoreOf = async (type: string, periodKey: string, userId: string) =>
  (await PeriodScore.findOne({ type, periodKey, userId }).lean())?.score ?? 0;

const lifetimeOf = async (userId: string) =>
  (await Gamification.findOne({ userId }).lean())?.points ?? 0;

describe("Point Ledger (integration)", () => {
  let stop: () => Promise<void>;

  beforeAll(async () => {
    stop = await startMongo("point_ledger");
  }, 180_000);

  afterAll(async () => stop?.(), 30_000);

  beforeEach(async () => clearCollections());

  it("a Learning Action raises all three current Period Scores and Lifetime Points", async () => {
    const userId = oid().toString();
    const result = await recordPointEvent({
      userId,
      actionType: "COMPLETE_COURSE_CHAPTER",
      itemId: "chapter-1",
      now: MONDAY_NOON,
    });

    expect(result).toMatchObject({
      pointsEarned: 20,
      lifetimePoints: 20,
      countedForLeaderboard: true,
      periodScoreDelta: 20,
      periodKeys: {
        DAILY: "2026-09-21",
        WEEKLY: "2026-W39",
        MONTHLY: "2026-09",
      },
      periodScores: { DAILY: 20, WEEKLY: 20, MONTHLY: 20 },
    });
    expect(await scoreOf("DAILY", "2026-09-21", userId)).toBe(20);
    expect(await scoreOf("WEEKLY", "2026-W39", userId)).toBe(20);
    expect(await scoreOf("MONTHLY", "2026-09", userId)).toBe(20);
    expect(await PointEvent.countDocuments({ userId })).toBe(1);
  });

  it("an Engagement Action earns Lifetime Points only", async () => {
    const userId = oid().toString();
    const result = await recordPointEvent({
      userId,
      actionType: "ENROLL_COURSE",
      now: MONDAY_NOON,
    });

    expect(result.countedForLeaderboard).toBe(false);
    expect(result.notCountedReason).toBe("ENGAGEMENT");
    expect(result.lifetimePoints).toBe(50);
    expect(await PeriodScore.countDocuments({ userId })).toBe(0);
  });

  it("a Learning Action without a Learning Item never reaches the leaderboard", async () => {
    const result = await recordPointEvent({
      userId: oid().toString(),
      actionType: "COMPLETE_QUESTION",
      now: MONDAY_NOON,
    });
    expect(result.notCountedReason).toBe("MISSING_ITEM");
    expect(result.periodScores.WEEKLY).toBe(0);
  });

  it("complete → un-complete → complete nets the item's value once", async () => {
    const userId = oid().toString();
    const base = {
      userId,
      actionType: "COMPLETE_QUESTION" as const,
      itemId: "q1",
    };

    await recordPointEvent({ ...base, now: MONDAY_NOON });
    const undone = await recordPointEvent({
      ...base,
      isReversal: true,
      now: minutesLater(MONDAY_NOON, 1),
    });
    expect(undone.periodScoreDelta).toBe(-10);

    await recordPointEvent({ ...base, now: minutesLater(MONDAY_NOON, 10) });

    expect(await scoreOf("WEEKLY", "2026-W39", userId)).toBe(10);
    expect(await lifetimeOf(userId)).toBe(10);
  });

  it("repeated un-completes take points back only once", async () => {
    const userId = oid().toString();
    const base = {
      userId,
      actionType: "COMPLETE_QUESTION" as const,
      itemId: "q1",
    };
    await recordPointEvent({
      userId,
      actionType: "ENROLL_COURSE",
      now: MONDAY_NOON,
    });
    await recordPointEvent({ ...base, now: MONDAY_NOON });
    expect(await lifetimeOf(userId)).toBe(60);

    await recordPointEvent({ ...base, isReversal: true, now: MONDAY_NOON });
    const again = await recordPointEvent({
      ...base,
      isReversal: true,
      now: MONDAY_NOON,
    });

    expect(again.pointsEarned).toBe(0);
    expect(await lifetimeOf(userId)).toBe(50);
    expect(await scoreOf("WEEKLY", "2026-W39", userId)).toBe(0);
  });

  it("takes back points for an item completed before the ledger existed, once", async () => {
    const userId = oid().toString();
    await Gamification.collection.insertOne({
      userId: new mongoose.Types.ObjectId(userId),
      points: 100,
    });
    const legacy = {
      userId,
      actionType: "COMPLETE_QUESTION" as const,
      itemId: "legacy-q",
      isReversal: true,
      now: MONDAY_NOON,
    };

    expect((await recordPointEvent(legacy)).pointsEarned).toBe(-10);
    expect((await recordPointEvent(legacy)).pointsEarned).toBe(0);
    expect(await lifetimeOf(userId)).toBe(90);
  });

  it("un-completing an item that was never credited changes nothing on the board", async () => {
    const userId = oid().toString();
    const result = await recordPointEvent({
      userId,
      actionType: "COMPLETE_QUESTION",
      itemId: "never-done",
      isReversal: true,
      now: MONDAY_NOON,
    });
    expect(result.notCountedReason).toBe("NOT_CREDITED");
    expect(await PeriodScore.countDocuments({ userId })).toBe(0);
  });

  it("retaking a completed quiz adds neither Period Score nor Lifetime Points", async () => {
    const userId = oid().toString();
    const quiz = {
      userId,
      actionType: "COMPLETE_QUIZ" as const,
      itemId: "quiz-1",
    };

    await recordPointEvent({ ...quiz, now: MONDAY_NOON });
    const retake = await recordPointEvent({
      ...quiz,
      now: minutesLater(MONDAY_NOON, 30),
    });

    expect(retake.notCountedReason).toBe("ALREADY_CREDITED");
    expect(retake.pointsEarned).toBe(0);
    expect(await scoreOf("WEEKLY", "2026-W39", userId)).toBe(30);
    expect(await lifetimeOf(userId)).toBe(30);
  });

  describe("Pace Limit", () => {
    it("counts only one Base Learning Action per 3 minutes", async () => {
      const userId = oid().toString();
      const first = await recordPointEvent({
        userId,
        actionType: "COMPLETE_QUESTION",
        itemId: "q1",
        now: MONDAY_NOON,
      });
      const second = await recordPointEvent({
        userId,
        actionType: "COMPLETE_QUESTION",
        itemId: "q2",
        now: minutesLater(MONDAY_NOON, 1),
      });

      expect(first.countedForLeaderboard).toBe(true);
      expect(second.countedForLeaderboard).toBe(false);
      expect(second.notCountedReason).toBe("PACE_LIMIT");
      expect(await scoreOf("WEEKLY", "2026-W39", userId)).toBe(10);
      expect(await lifetimeOf(userId)).toBe(20);
    });

    it("releases the credit of a throttled item so it can count later", async () => {
      const userId = oid().toString();
      await recordPointEvent({
        userId,
        actionType: "COMPLETE_QUESTION",
        itemId: "q1",
        now: MONDAY_NOON,
      });
      await recordPointEvent({
        userId,
        actionType: "COMPLETE_QUESTION",
        itemId: "q2",
        now: minutesLater(MONDAY_NOON, 1),
      });
      expect(
        await LearningCredit.findOne({ userId, itemId: "q2" }).lean(),
      ).toMatchObject({ credited: false });

      const later = await recordPointEvent({
        userId,
        actionType: "COMPLETE_QUESTION",
        itemId: "q2",
        now: minutesLater(MONDAY_NOON, 5),
      });
      expect(later.countedForLeaderboard).toBe(true);
      expect(later.pointsEarned).toBe(0); // Lifetime Points were already earned
      expect(await scoreOf("WEEKLY", "2026-W39", userId)).toBe(20);
      expect(await lifetimeOf(userId)).toBe(20);
    });

    it("never paces Bonus Learning Actions (quiz completion + perfect score together)", async () => {
      const userId = oid().toString();
      const completion = await recordPointEvent({
        userId,
        actionType: "COMPLETE_QUIZ",
        itemId: "quiz-1",
        now: MONDAY_NOON,
      });
      const perfect = await recordPointEvent({
        userId,
        actionType: "QUIZ_PERFECT_SCORE",
        itemId: "quiz-1",
        now: MONDAY_NOON,
      });

      expect(completion.countedForLeaderboard).toBe(true);
      expect(perfect.countedForLeaderboard).toBe(true);
      expect(await scoreOf("WEEKLY", "2026-W39", userId)).toBe(80);
    });

    it("counts exactly one of many concurrent Base Learning Actions", async () => {
      const userId = oid().toString();
      // Create the learner's gamification doc first, as any real learner has one.
      await recordPointEvent({
        userId,
        actionType: "DAILY_VISIT",
        now: MONDAY_NOON,
      });

      const results = await Promise.all(
        Array.from({ length: 6 }, (_, i) =>
          recordPointEvent({
            userId,
            actionType: "COMPLETE_QUESTION",
            itemId: `q${i}`,
            now: MONDAY_NOON,
          }),
        ),
      );

      expect(results.filter((r) => r.countedForLeaderboard)).toHaveLength(1);
      expect(await scoreOf("WEEKLY", "2026-W39", userId)).toBe(10);
    });
  });

  it("a reversal in a later Period subtracts from the current Period only", async () => {
    const userId = oid().toString();
    const sunday = ist("2026-09-27T22:00:00"); // W39
    const monday = ist("2026-09-28T09:00:00"); // W40

    await recordPointEvent({
      userId,
      actionType: "COMPLETE_QUESTION",
      itemId: "q1",
      now: sunday,
    });
    const reversal = await recordPointEvent({
      userId,
      actionType: "COMPLETE_QUESTION",
      itemId: "q1",
      isReversal: true,
      now: monday,
    });

    expect(await scoreOf("WEEKLY", "2026-W39", userId)).toBe(10);
    expect(await scoreOf("WEEKLY", "2026-W40", userId)).toBe(-10);
    // Displayed Period Scores are floored at 0.
    expect(reversal.periodScores.WEEKLY).toBe(0);
  });

  it("never lets Lifetime Points go below zero", async () => {
    const userId = oid().toString();
    await recordPointEvent({
      userId,
      actionType: "DAILY_VISIT",
      now: MONDAY_NOON,
    });
    const result = await recordPointEvent({
      userId,
      actionType: "ENROLL_COURSE",
      isReversal: true,
      now: MONDAY_NOON,
    });
    expect(result.lifetimePoints).toBe(0);
  });

  it("rejects unknown action types and invalid learners", async () => {
    await expect(
      recordPointEvent({
        userId: oid().toString(),
        actionType: "NOT_AN_ACTION" as never,
      }),
    ).rejects.toThrow();
    await expect(
      recordPointEvent({ userId: "nope", actionType: "DAILY_VISIT" }),
    ).rejects.toThrow("Invalid userId");
  });
});
