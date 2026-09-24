/**
 * Leaderboard Reader (integration): ordering, tie-break, visibility, masking and
 * the viewer's own standing.
 */
import { PeriodScore, User } from "@api/lib/database/models";
import {
  getLeaderboardBoard,
  getViewerStanding,
  invalidateHiddenLearnerCache,
} from "@api/lib/database/queries/leaderboard";
import type mongoose from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { clearCollections, ist, oid, startMongo } from "./mongo";

const NOW = ist("2026-09-24T12:00:00");
const WEEK = "2026-W39";

const learner = async (
  name: string,
  score: number,
  reachedAt: Date,
  leaderboard?: { visible?: boolean; excluded?: boolean },
) => {
  const _id = oid();
  await User.collection.insertOne({
    _id,
    name,
    email: `${_id.toString()}@example.com`,
    image: `https://img/${name}.png`,
    ...(leaderboard ? { leaderboard } : {}),
  });
  await PeriodScore.create({
    type: "WEEKLY",
    periodKey: WEEK,
    userId: _id,
    score,
    reachedAt,
  });
  return _id as mongoose.Types.ObjectId;
};

describe("Leaderboard Reader (integration)", () => {
  let stop: () => Promise<void>;

  beforeAll(async () => {
    stop = await startMongo("leaderboard_reader");
  }, 180_000);

  afterAll(async () => stop?.(), 30_000);

  beforeEach(async () => {
    await clearCollections();
    invalidateHiddenLearnerCache();
  });

  it("ranks by score, then by who reached the score first", async () => {
    await learner("Late Tie", 100, ist("2026-09-23T10:00:00"));
    await learner("Early Tie", 100, ist("2026-09-22T10:00:00"));
    await learner("Leader", 150, ist("2026-09-23T10:00:00"));
    await learner("Zero", 0, ist("2026-09-22T10:00:00"));
    await learner("Negative", -10, ist("2026-09-22T10:00:00"));

    const board = await getLeaderboardBoard({ type: "WEEKLY", now: NOW });

    expect(board.entries.map((e) => [e.rank, e.displayName])).toEqual([
      [1, "Leader"],
      [2, "Early Tie"],
      [3, "Late Tie"],
    ]);
    expect(board.totalLearners).toBe(3);
    expect(board.periodKey).toBe(WEEK);
    expect(board.resetsAt).toBe(ist("2026-09-28T00:00:00").toISOString());
  });

  it("hides hidden and excluded learners from others and closes the gap", async () => {
    await learner("Alice", 300, NOW);
    const hidden = await learner("Hidden Hari", 250, NOW, { visible: false });
    await learner("Excluded Eve", 200, NOW, { excluded: true });
    const bob = await learner("Bob", 100, NOW);

    const board = await getLeaderboardBoard({ type: "WEEKLY", now: NOW });
    expect(board.entries.map((e) => [e.rank, e.displayName])).toEqual([
      [1, "Alice"],
      [2, "Bob"],
    ]);

    const bobStanding = await getViewerStanding("WEEKLY", WEEK, bob.toString());
    expect(bobStanding.rank).toBe(2);
    expect(bobStanding.nextTarget).toEqual({
      displayName: "Alice",
      gap: 201,
      rank: 1,
    });

    // A hidden learner still sees where they would rank.
    const hiddenStanding = await getViewerStanding(
      "WEEKLY",
      WEEK,
      hidden.toString(),
    );
    expect(hiddenStanding.rank).toBe(2);
    expect(hiddenStanding.score).toBe(250);
  });

  it("shows admins everyone, flagged", async () => {
    await learner("Alice", 300, NOW);
    await learner("Hidden Hari", 250, NOW, { visible: false });
    await learner("Excluded Eve", 200, NOW, { excluded: true });

    const board = await getLeaderboardBoard({
      type: "WEEKLY",
      audience: "admin",
      now: NOW,
    });
    expect(
      board.entries.map((e) => [e.displayName, e.hidden, e.excluded]),
    ).toEqual([
      ["Alice", false, false],
      ["Hidden Hari", true, false],
      ["Excluded Eve", false, true],
    ]);
  });

  it("masks names and strips ids for the public audience", async () => {
    await learner("Priya Sharma", 120, NOW);
    const viewer = await learner("Rahul Verma", 80, NOW);

    const board = await getLeaderboardBoard({
      type: "WEEKLY",
      audience: "public",
      viewerId: viewer.toString(),
      now: NOW,
    });

    expect(board.entries[0]).toEqual({
      rank: 1,
      displayName: "Priya S.",
      image: "https://img/Priya Sharma.png",
      score: 120,
    });
    expect(board.viewer).toBeUndefined();
    expect(JSON.stringify(board)).not.toContain("@example.com");
  });

  it("fills the board past a run of hidden learners", async () => {
    for (let i = 0; i < 25; i++) {
      await learner(`Hidden ${i}`, 1000 - i, NOW, { visible: false });
    }
    await learner("Visible One", 10, NOW);
    await learner("Visible Two", 5, NOW);

    const board = await getLeaderboardBoard({ type: "WEEKLY", limit: 2, now: NOW });
    expect(board.entries.map((e) => e.displayName)).toEqual([
      "Visible One",
      "Visible Two",
    ]);
  });

  it("gives a viewer with no Period Score no rank", async () => {
    const standing = await getViewerStanding("WEEKLY", WEEK, oid().toString());
    expect(standing).toEqual({ rank: null, score: 0, nextTarget: null });
  });

  it("caps the limit", async () => {
    await learner("Alice", 10, NOW);
    const board = await getLeaderboardBoard({ type: "WEEKLY", limit: 10_000, now: NOW });
    expect(board.entries).toHaveLength(1);
  });
});
