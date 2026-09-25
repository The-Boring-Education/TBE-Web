/**
 * Period Close (integration): Champions are frozen once, top finishers are
 * emailed exactly once, and retries only resend what failed.
 */
import { PeriodClose, PeriodScore, User } from "@api/lib/database/models";
import { invalidateHiddenLearnerCache } from "@api/lib/database/queries/leaderboard";
import {
  getChampionBadgeCounts,
  getPeriodChampions,
} from "@api/lib/database/queries/leaderboard";
import { closePeriod } from "@api/lib/database/queries/periodClose";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { clearCollections, ist, oid, startMongo } from "./mongo";

const AFTER_WEEK = ist("2026-09-28T00:05:00");

const seed = async (
  type: "DAILY" | "WEEKLY",
  periodKey: string,
  count: number,
  overrides: Record<
    number,
    { visible?: boolean; excluded?: boolean; emails?: boolean }
  > = {},
) => {
  const ids = [];
  for (let i = 0; i < count; i++) {
    const _id = oid();
    await User.collection.insertOne({
      _id,
      name: `Learner ${i + 1}`,
      email: `l${i + 1}@example.com`,
      ...(overrides[i] ? { leaderboard: overrides[i] } : {}),
    });
    await PeriodScore.create({
      type,
      periodKey,
      userId: _id,
      score: 1000 - i * 10,
      reachedAt: ist("2026-09-22T10:00:00"),
    });
    ids.push(_id.toString());
  }
  return ids;
};

describe("Period Close (integration)", () => {
  let stop: () => Promise<void>;

  beforeAll(async () => {
    stop = await startMongo("period_close");
  }, 180_000);

  afterAll(async () => stop?.(), 30_000);

  beforeEach(async () => {
    await clearCollections();
    invalidateHiddenLearnerCache();
  });

  it("refuses to close a Period that has not ended", async () => {
    await expect(
      closePeriod({
        type: "WEEKLY",
        periodKey: "2026-W39",
        notify: vi.fn(),
        now: ist("2026-09-27T23:59:00"),
      }),
    ).rejects.toMatchObject({ code: "PERIOD_NOT_ENDED" });
    await expect(
      closePeriod({ type: "WEEKLY", periodKey: "bad", notify: vi.fn() }),
    ).rejects.toMatchObject({ code: "INVALID_PERIOD" });
  });

  it("freezes the top 3 as Champions and emails the weekly top 10 once", async () => {
    const ids = await seed("WEEKLY", "2026-W39", 12);
    const notify = vi.fn().mockResolvedValue(true);

    const first = await closePeriod({
      type: "WEEKLY",
      periodKey: "2026-W39",
      notify,
      now: AFTER_WEEK,
    });

    expect(first.alreadyClosed).toBe(false);
    expect(first.champions.map((c) => c.userId)).toEqual(ids.slice(0, 3));
    expect(first.sent).toBe(10);
    expect(notify).toHaveBeenCalledTimes(10);
    expect(notify.mock.calls[0]).toEqual([
      "WEEKLY",
      expect.objectContaining({
        userId: ids[0],
        email: "l1@example.com",
        rank: 1,
        score: 1000,
      }),
    ]);

    // A late score change cannot rewrite frozen Champions, and a retry sends nothing.
    await PeriodScore.updateOne({ userId: ids[11] }, { $set: { score: 9999 } });
    const second = await closePeriod({
      type: "WEEKLY",
      periodKey: "2026-W39",
      notify,
      now: AFTER_WEEK,
    });
    expect(second.alreadyClosed).toBe(true);
    expect(second.champions.map((c) => c.userId)).toEqual(ids.slice(0, 3));
    expect(second.sent).toBe(0);
    expect(notify).toHaveBeenCalledTimes(10);
    expect(await PeriodClose.countDocuments()).toBe(1);
  });

  it("emails only the daily top 3", async () => {
    await seed("DAILY", "2026-09-24", 6);
    const notify = vi.fn().mockResolvedValue(true);
    const result = await closePeriod({
      type: "DAILY",
      periodKey: "2026-09-24",
      notify,
      now: ist("2026-09-25T00:05:00"),
    });
    expect(result.sent).toBe(3);
  });

  it("never crowns hidden or excluded learners and skips unsubscribed ones", async () => {
    const ids = await seed("DAILY", "2026-09-24", 5, {
      0: { visible: false },
      1: { excluded: true },
      2: { emails: false },
    });
    const notify = vi.fn().mockResolvedValue(true);

    const result = await closePeriod({
      type: "DAILY",
      periodKey: "2026-09-24",
      notify,
      now: ist("2026-09-25T00:05:00"),
    });

    expect(result.champions.map((c) => [c.userId, c.rank])).toEqual([
      [ids[2], 1],
      [ids[3], 2],
      [ids[4], 3],
    ]);
    expect(result.skipped).toBe(1);
    expect(result.sent).toBe(2);
  });

  it("retries only the recipients whose email failed", async () => {
    const ids = await seed("DAILY", "2026-09-24", 3);
    const failing = vi
      .fn()
      .mockImplementation(
        async (_t: string, r: { userId: string }) => r.userId !== ids[1],
      );
    const first = await closePeriod({
      type: "DAILY",
      periodKey: "2026-09-24",
      notify: failing,
      now: ist("2026-09-25T00:05:00"),
    });
    expect(first).toMatchObject({ sent: 2, failed: 1 });

    const retry = vi.fn().mockResolvedValue(true);
    const second = await closePeriod({
      type: "DAILY",
      periodKey: "2026-09-24",
      notify: retry,
      now: ist("2026-09-25T00:10:00"),
    });
    expect(second.sent).toBe(1);
    expect(retry).toHaveBeenCalledTimes(1);
    expect(retry.mock.calls[0]![1]).toMatchObject({ userId: ids[1] });
  });

  it("exposes Champions and Weekly/Monthly Champion Badge counts", async () => {
    const ids = await seed("WEEKLY", "2026-W39", 3);
    await closePeriod({
      type: "WEEKLY",
      periodKey: "2026-W39",
      notify: vi.fn().mockResolvedValue(true),
      now: AFTER_WEEK,
    });
    await PeriodScore.create({
      type: "DAILY",
      periodKey: "2026-09-27",
      userId: ids[0],
      score: 50,
      reachedAt: AFTER_WEEK,
    });
    await closePeriod({
      type: "DAILY",
      periodKey: "2026-09-27",
      notify: vi.fn().mockResolvedValue(true),
      now: AFTER_WEEK,
    });

    const champions = await getPeriodChampions("WEEKLY", undefined, AFTER_WEEK);
    expect(champions?.periodKey).toBe("2026-W39");
    expect(champions?.champions.map((c) => c.displayName)).toEqual([
      "Learner 1",
      "Learner 2",
      "Learner 3",
    ]);
    // Daily wins are recorded but not badged.
    expect(await getChampionBadgeCounts(ids[0]!)).toEqual({
      WEEKLY: 1,
      MONTHLY: 0,
    });
  });

  it("never emails anyone twice when close runs overlap", async () => {
    await seed("WEEKLY", "2026-W39", 10);
    // Slow sends widen the window in which two runs could both see a pending recipient.
    const notify = vi
      .fn()
      .mockImplementation(
        () =>
          new Promise<boolean>((resolve) =>
            setTimeout(() => resolve(true), 20),
          ),
      );

    const runs = await Promise.all(
      Array.from({ length: 3 }, () =>
        closePeriod({
          type: "WEEKLY",
          periodKey: "2026-W39",
          notify,
          now: AFTER_WEEK,
        }),
      ),
    );

    expect(notify).toHaveBeenCalledTimes(10);
    const recipients = notify.mock.calls.map(([, r]) => r.userId);
    expect(new Set(recipients).size).toBe(10);
    expect(runs.reduce((n, r) => n + r.sent, 0)).toBe(10);
    const record = await PeriodClose.findOne().lean();
    expect(record?.notified.every((n) => n.sentAt)).toBe(true);
  });

  it("releases a recipient's claim when the send throws, so a retry can deliver", async () => {
    const ids = await seed("DAILY", "2026-09-24", 1);
    const now = ist("2026-09-25T00:05:00");
    const first = await closePeriod({
      type: "DAILY",
      periodKey: "2026-09-24",
      notify: vi.fn().mockRejectedValue(new Error("provider down")),
      now,
    });
    expect(first).toMatchObject({ sent: 0, failed: 1 });

    const retry = vi.fn().mockResolvedValue(true);
    await closePeriod({
      type: "DAILY",
      periodKey: "2026-09-24",
      notify: retry,
      now,
    });
    expect(retry).toHaveBeenCalledTimes(1);
    expect(retry.mock.calls[0]![1]).toMatchObject({ userId: ids[0] });
  });

  it("drops Champions who are hidden or excluded after the Period closed, except for admins", async () => {
    const ids = await seed("WEEKLY", "2026-W39", 3);
    await closePeriod({
      type: "WEEKLY",
      periodKey: "2026-W39",
      notify: vi.fn().mockResolvedValue(true),
      now: AFTER_WEEK,
    });
    await User.updateOne(
      { _id: ids[0] },
      { $set: { "leaderboard.excluded": true } },
    );

    const member = await getPeriodChampions("WEEKLY", "2026-W39", AFTER_WEEK);
    expect(member?.champions.map((c) => c.rank)).toEqual([2, 3]);

    const admin = await getPeriodChampions(
      "WEEKLY",
      "2026-W39",
      AFTER_WEEK,
      "admin",
    );
    expect(admin?.champions.map((c) => c.rank)).toEqual([1, 2, 3]);
  });

  it("masks Champions for the public audience", async () => {
    await seed("WEEKLY", "2026-W39", 1);
    await User.updateOne({}, { $set: { name: "Priya Sharma" } });
    await closePeriod({
      type: "WEEKLY",
      periodKey: "2026-W39",
      notify: vi.fn().mockResolvedValue(true),
      now: AFTER_WEEK,
    });

    const publicView = await getPeriodChampions(
      "WEEKLY",
      "2026-W39",
      AFTER_WEEK,
      "public",
    );
    expect(publicView?.champions).toEqual([
      { rank: 1, displayName: "Priya S.", image: undefined, score: 1000 },
    ]);
  });
});
