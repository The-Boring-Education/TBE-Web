import { describe, expect, it } from "vitest";

import {
  ALLOWED_SUBMISSION_TRANSITIONS,
  canTransition,
  SUBMISSION_STATUSES,
} from "@/lib/contributor/submissionState";

describe("submission state machine", () => {
  const table = SUBMISSION_STATUSES.flatMap((from) =>
    SUBMISSION_STATUSES.map((to) => ({
      from,
      to,
      expected: ALLOWED_SUBMISSION_TRANSITIONS[from].includes(to),
    })),
  );

  it.each(table)("$from -> $to is $expected", ({ from, to, expected }) => {
    expect(canTransition(from, to)).toBe(expected);
  });

  it("covers the full 5x5 transition table", () => {
    expect(table).toHaveLength(25);
  });

  it("never allows a transition out of a terminal status", () => {
    expect(canTransition("rejected", "pending")).toBe(false);
    expect(canTransition("retracted", "approved")).toBe(false);
  });

  it("returns false for unknown statuses", () => {
    expect(
      canTransition(
        "unknown" as (typeof SUBMISSION_STATUSES)[number],
        "approved",
      ),
    ).toBe(false);
  });
});
