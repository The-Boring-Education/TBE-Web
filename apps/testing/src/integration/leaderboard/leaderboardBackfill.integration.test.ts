/**
 * Backfill of in-flight Periods from legacy Gamification.actions[] (integration).
 */
import { Gamification, PeriodScore } from "@api/lib/database/models";
import { backfillCurrentPeriodScores } from "@api/lib/database/queries/leaderboardBackfill";
import { recordPointEvent } from "@api/lib/database/queries/pointLedger";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { clearCollections, ist, oid, startMongo } from "./mongo";

const NOW = ist("2026-09-24T12:00:00"); // Thu, W39, Sep

const scores = async (userId: unknown) =>
  Object.fromEntries(
    (await PeriodScore.find({ userId }).lean()).map((d) => [
      `${d.type}:${d.periodKey}`,
      d.score,
    ]),
  );

describe("backfillCurrentPeriodScores (integration)", () => {
  let stop: () => Promise<void>;

  beforeAll(async () => {
    stop = await startMongo("leaderboard_backfill");
  }, 180_000);

  afterAll(async () => stop?.(), 30_000);

  beforeEach(async () => clearCollections());

  it("adds only Learning Actions inside each current Period, idempotently", async () => {
    const userId = oid();
    await Gamification.collection.insertOne({
      userId,
      points: 999,
      actions: [
        { actionType: "COMPLETE_QUESTION", pointsEarned: 10, createdAt: ist("2026-09-24T09:00:00") }, // today
        { actionType: "COMPLETE_QUIZ", pointsEarned: 30, createdAt: ist("2026-09-22T09:00:00") }, // this week
        { actionType: "COMPLETE_PROJECT_CHAPTER", pointsEarned: 30, createdAt: ist("2026-09-10T09:00:00") }, // this month
        { actionType: "COMPLETE_QUESTION", pointsEarned: 10, createdAt: ist("2026-08-30T09:00:00") }, // last month
        { actionType: "ENROLL_COURSE", pointsEarned: 50, createdAt: ist("2026-09-24T09:30:00") }, // engagement
      ],
    });

    const first = await backfillCurrentPeriodScores({ now: NOW });
    expect(first).toMatchObject({ learners: 1, counters: 3 });
    const expected = {
      "DAILY:2026-09-24": 10,
      "WEEKLY:2026-W39": 40,
      "MONTHLY:2026-09": 70,
    };
    expect(await scores(userId)).toEqual(expected);

    await backfillCurrentPeriodScores({ now: NOW });
    expect(await scores(userId)).toEqual(expected);
  });

  it("keeps live Point Events recorded after launch when re-run", async () => {
    const userId = oid();
    await Gamification.collection.insertOne({
      userId,
      points: 10,
      actions: [
        { actionType: "COMPLETE_QUESTION", pointsEarned: 10, createdAt: ist("2026-09-24T09:00:00") },
      ],
    });
    await backfillCurrentPeriodScores({ now: NOW });
    await recordPointEvent({
      userId: userId.toString(),
      actionType: "COMPLETE_QUESTION",
      itemId: "live-q",
      now: NOW,
    });
    await backfillCurrentPeriodScores({ now: NOW });

    expect((await scores(userId))["WEEKLY:2026-W39"]).toBe(20);
  });

  it("writes nothing on a dry run", async () => {
    await Gamification.collection.insertOne({
      userId: oid(),
      points: 10,
      actions: [
        { actionType: "COMPLETE_QUESTION", pointsEarned: 10, createdAt: ist("2026-09-24T09:00:00") },
      ],
    });
    const result = await backfillCurrentPeriodScores({ now: NOW, dryRun: true });
    expect(result.counters).toBe(3);
    expect(await PeriodScore.countDocuments()).toBe(0);
  });
});
