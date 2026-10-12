import { describe, expect, it } from "vitest";

import { cohortClock } from "@/lib/contributor/cohortClock";

const iso = (date: Date) => date.toISOString();

describe("cohort clock", () => {
  const endsAtCases = [
    {
      name: "Jan-15 + 4 months = May-15",
      startedAt: "2024-01-15T00:00:00.000Z",
      expected: "2024-05-15T00:00:00.000Z",
    },
    {
      name: "Jan-31 + 4 months = May-31 (May has 31 days)",
      startedAt: "2024-01-31T00:00:00.000Z",
      expected: "2024-05-31T00:00:00.000Z",
    },
    {
      name: "Oct-31 + 4 months snaps to Feb-29 in a leap year",
      startedAt: "2023-10-31T00:00:00.000Z",
      expected: "2024-02-29T00:00:00.000Z",
    },
    {
      name: "Oct-31 + 4 months snaps to Feb-28 in a non-leap year",
      startedAt: "2024-10-31T00:00:00.000Z",
      expected: "2025-02-28T00:00:00.000Z",
    },
    {
      name: "crosses the year boundary",
      startedAt: "2024-11-10T09:30:00.000Z",
      expected: "2025-03-10T09:30:00.000Z",
    },
  ];

  it.each(endsAtCases)("$name", ({ startedAt, expected }) => {
    const { endsAt } = cohortClock(new Date(startedAt), new Date(startedAt));
    expect(iso(endsAt)).toBe(expected);
  });

  it("preserves the time of day of the start date", () => {
    const { endsAt } = cohortClock(
      new Date("2024-01-15T13:45:30.250Z"),
      new Date("2024-01-15T13:45:30.250Z"),
    );
    expect(iso(endsAt)).toBe("2024-05-15T13:45:30.250Z");
  });

  const remainingCases = [
    {
      name: "counts whole days remaining",
      now: "2024-05-10T00:00:00.000Z",
      daysRemaining: 5,
      inCohort: true,
    },
    {
      name: "floors partial days",
      now: "2024-05-10T12:00:00.000Z",
      daysRemaining: 4,
      inCohort: true,
    },
    {
      name: "is zero exactly at endsAt",
      now: "2024-05-15T00:00:00.000Z",
      daysRemaining: 0,
      inCohort: false,
    },
    {
      name: "floors at zero past endsAt",
      now: "2024-07-01T00:00:00.000Z",
      daysRemaining: 0,
      inCohort: false,
    },
  ];

  it.each(remainingCases)("$name", ({ now, daysRemaining, inCohort }) => {
    const clock = cohortClock(
      new Date("2024-01-15T00:00:00.000Z"),
      new Date(now),
    );
    expect(clock.daysRemaining).toBe(daysRemaining);
    expect(clock.inCohort).toBe(inCohort);
  });

  it("returns a null graduatedAt while in the cohort", () => {
    const clock = cohortClock(
      new Date("2024-01-15T00:00:00.000Z"),
      new Date("2024-02-01T00:00:00.000Z"),
    );
    expect(clock.graduatedAt).toBeNull();
  });

  it("graduates at endsAt once the cohort is over", () => {
    const clock = cohortClock(
      new Date("2024-01-15T00:00:00.000Z"),
      new Date("2024-05-15T00:00:00.000Z"),
    );
    expect(clock.graduatedAt).not.toBeNull();
    expect(iso(clock.graduatedAt as Date)).toBe(iso(clock.endsAt));
  });
});
