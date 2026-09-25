import {
  formatResetCountdown,
  getPeriodBounds,
  getPeriodKey,
  getPeriodKeysAt,
  getPeriodResetsAt,
  getPreviousPeriodKey,
  hasPeriodEnded,
  isValidPeriodKey,
  maskLearnerName,
} from "@tbe/utils/leaderboard";
import { describe, expect, it } from "vitest";

/** Build a UTC instant from an IST wall-clock time. */
const ist = (iso: string) => new Date(`${iso}+05:30`);

describe("Period Calendar", () => {
  describe("daily boundaries are IST midnight", () => {
    it("23:59 IST belongs to that IST day", () => {
      expect(getPeriodKey("DAILY", ist("2026-09-24T23:59:59"))).toBe(
        "2026-09-24",
      );
    });

    it("00:00 IST starts the next day even though it is still the previous UTC day", () => {
      const instant = ist("2026-09-25T00:00:00");
      expect(instant.toISOString()).toBe("2026-09-24T18:30:00.000Z");
      expect(getPeriodKey("DAILY", instant)).toBe("2026-09-25");
    });

    it("bounds span exactly one IST day", () => {
      const { start, end } = getPeriodBounds("DAILY", "2026-09-24");
      expect(start).toEqual(ist("2026-09-24T00:00:00"));
      expect(end).toEqual(ist("2026-09-25T00:00:00"));
    });
  });

  describe("weekly periods are ISO weeks starting Monday IST", () => {
    it("Sunday 23:59 IST and Monday 00:00 IST fall in different weeks", () => {
      // 2026-09-27 is a Sunday
      expect(getPeriodKey("WEEKLY", ist("2026-09-27T23:59:59"))).toBe(
        "2026-W39",
      );
      expect(getPeriodKey("WEEKLY", ist("2026-09-28T00:00:00"))).toBe(
        "2026-W40",
      );
    });

    it("bounds run Monday 00:00 to next Monday 00:00 IST", () => {
      const { start, end } = getPeriodBounds("WEEKLY", "2026-W39");
      expect(start).toEqual(ist("2026-09-21T00:00:00"));
      expect(end).toEqual(ist("2026-09-28T00:00:00"));
    });

    it("uses the ISO week-year at year boundaries", () => {
      // 2027-01-01 is a Friday → still ISO week 53 of 2026
      expect(getPeriodKey("WEEKLY", ist("2027-01-01T10:00:00"))).toBe(
        "2026-W53",
      );
      // 2024-12-30 is a Monday → ISO week 1 of 2025
      expect(getPeriodKey("WEEKLY", ist("2024-12-30T10:00:00"))).toBe(
        "2025-W01",
      );
    });

    it("round-trips every week of a year", () => {
      for (let w = 1; w <= 52; w++) {
        const key = `2026-W${String(w).padStart(2, "0")}`;
        const { start, end } = getPeriodBounds("WEEKLY", key);
        expect(getPeriodKey("WEEKLY", start)).toBe(key);
        expect(getPeriodKey("WEEKLY", new Date(end.getTime() - 1))).toBe(key);
      }
    });
  });

  describe("monthly periods are IST calendar months", () => {
    it("the last IST minute of a month stays in that month", () => {
      expect(getPeriodKey("MONTHLY", ist("2026-09-30T23:59:00"))).toBe(
        "2026-09",
      );
      expect(getPeriodKey("MONTHLY", ist("2026-10-01T00:00:00"))).toBe(
        "2026-10",
      );
    });

    it("bounds handle short months and year rollover", () => {
      expect(getPeriodBounds("MONTHLY", "2026-02").end).toEqual(
        ist("2026-03-01T00:00:00"),
      );
      expect(getPeriodBounds("MONTHLY", "2026-12").end).toEqual(
        ist("2027-01-01T00:00:00"),
      );
    });
  });

  it("getPeriodKeysAt returns all three keys", () => {
    expect(getPeriodKeysAt(ist("2026-09-24T12:00:00"))).toEqual({
      DAILY: "2026-09-24",
      WEEKLY: "2026-W39",
      MONTHLY: "2026-09",
    });
  });

  it("getPeriodResetsAt is the end of the current Period", () => {
    const now = ist("2026-09-24T12:00:00");
    expect(getPeriodResetsAt("DAILY", now)).toEqual(ist("2026-09-25T00:00:00"));
    expect(getPeriodResetsAt("WEEKLY", now)).toEqual(
      ist("2026-09-28T00:00:00"),
    );
    expect(getPeriodResetsAt("MONTHLY", now)).toEqual(
      ist("2026-10-01T00:00:00"),
    );
  });

  it("getPreviousPeriodKey steps back one Period", () => {
    const now = ist("2026-01-01T00:30:00");
    expect(getPreviousPeriodKey("DAILY", now)).toBe("2025-12-31");
    expect(getPreviousPeriodKey("WEEKLY", now)).toBe("2025-W52");
    expect(getPreviousPeriodKey("MONTHLY", now)).toBe("2025-12");
  });

  it("hasPeriodEnded is false during and true from the reset instant", () => {
    expect(
      hasPeriodEnded("DAILY", "2026-09-24", ist("2026-09-24T23:59:59")),
    ).toBe(false);
    expect(
      hasPeriodEnded("DAILY", "2026-09-24", ist("2026-09-25T00:00:00")),
    ).toBe(true);
  });

  it("validates period keys", () => {
    expect(isValidPeriodKey("DAILY", "2026-09-24")).toBe(true);
    expect(isValidPeriodKey("DAILY", "2026-02-31")).toBe(false);
    expect(isValidPeriodKey("WEEKLY", "2026-W39")).toBe(true);
    expect(isValidPeriodKey("WEEKLY", "2026-W60")).toBe(false);
    expect(isValidPeriodKey("MONTHLY", "2026-13")).toBe(false);
    expect(isValidPeriodKey("MONTHLY", { $gt: "" })).toBe(false);
    expect(() => getPeriodBounds("DAILY", "nope")).toThrow();
    // Impossible dates and weeks are rejected, not normalised.
    expect(() => getPeriodBounds("DAILY", "2026-02-31")).toThrow();
    expect(() => getPeriodBounds("WEEKLY", "2026-W60")).toThrow();
    expect(() => getPeriodBounds("MONTHLY", "2026-13")).toThrow();
  });
});

describe("maskLearnerName", () => {
  it.each([
    ["Priya Sharma", "Priya S."],
    ["  priya   kumari sharma ", "priya S."],
    ["Rahul", "Rahul"],
    ["", "TBE Learner"],
    [undefined, "TBE Learner"],
  ])("%s → %s", (input, expected) => {
    expect(maskLearnerName(input as string | undefined)).toBe(expected);
  });
});

describe("formatResetCountdown", () => {
  it.each([
    [2 * 86400000 + 4 * 3600000 + 5 * 60000, "2d 4h"],
    [3 * 3600000 + 12 * 60000, "3h 12m"],
    [45 * 60000, "45m"],
    [-1, "0m"],
  ])("%d ms → %s", (ms, expected) => {
    expect(formatResetCountdown(ms)).toBe(expected);
  });
});
