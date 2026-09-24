/**
 * awardPoints (integration): the summary the client toast renders.
 */
import { awardPoints } from "@api/lib/database/queries/learningAward";
import { recordPointEvent } from "@api/lib/database/queries/pointLedger";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { clearCollections, oid, startMongo } from "./mongo";

describe("awardPoints (integration)", () => {
  let stop: () => Promise<void>;

  beforeAll(async () => {
    stop = await startMongo("learning_award");
  }, 180_000);

  afterAll(async () => stop?.(), 30_000);

  beforeEach(async () => clearCollections());

  it("reports first appearance on the weekly board", async () => {
    const summary = await awardPoints({
      userId: oid().toString(),
      actionType: "COMPLETE_QUESTION",
      itemId: "q1",
    });
    expect(summary).toMatchObject({
      pointsEarned: 10,
      countedForLeaderboard: true,
      weekly: { score: 10, rank: 1, previousRank: null },
    });
  });

  it("reports how many places a learner climbed", async () => {
    const me = oid().toString();
    // Two rivals ahead of me, and me on the board already.
    for (const [rival, item] of [
      [oid().toString(), "quiz-a"],
      [oid().toString(), "quiz-b"],
    ] as const) {
      await recordPointEvent({ userId: rival, actionType: "COMPLETE_QUIZ", itemId: item });
    }
    await recordPointEvent({
      userId: me,
      actionType: "COMPLETE_QUESTION",
      itemId: "q1",
      now: new Date(Date.now() - 10 * 60_000),
    });

    const summary = await awardPoints({
      userId: me,
      actionType: "COMPLETE_PROJECT",
      itemId: "project-1",
    });

    expect(summary?.weekly).toEqual({ score: 110, rank: 1, previousRank: 3 });
  });

  it("explains a Pace Limit miss and never throws", async () => {
    const me = oid().toString();
    await awardPoints({ userId: me, actionType: "COMPLETE_QUESTION", itemId: "q1" });
    const summary = await awardPoints({
      userId: me,
      actionType: "COMPLETE_QUESTION",
      itemId: "q2",
    });
    expect(summary).toMatchObject({
      countedForLeaderboard: false,
      notCountedReason: "PACE_LIMIT",
      weekly: { rank: null },
    });

    expect(
      await awardPoints({ userId: "not-an-id", actionType: "COMPLETE_QUESTION" }),
    ).toBeUndefined();
  });
});
