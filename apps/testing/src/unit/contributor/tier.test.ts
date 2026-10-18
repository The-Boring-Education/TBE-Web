import { describe, expect, it } from "vitest";

import type { Tier } from "@/lib/contributor/tier";
import { tier } from "@/lib/contributor/tier";

describe("contributor tier resolver", () => {
  const cases: Array<{ points: number; expected: Tier }> = [
    { points: -1, expected: "contributor" },
    { points: 0, expected: "contributor" },
    { points: 49, expected: "contributor" },
    { points: 50, expected: "lead" },
    { points: 99, expected: "lead" },
    { points: 100, expected: "captain" },
    { points: 1000, expected: "captain" },
  ];

  it.each(cases)("maps $points points to $expected", ({ points, expected }) => {
    expect(tier(points)).toBe(expected);
  });
});
