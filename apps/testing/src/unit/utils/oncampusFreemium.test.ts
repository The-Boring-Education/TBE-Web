import { describe, expect, it } from "vitest";

describe("OnCampus Gating Logic", () => {
  it("calculates 30% limit with ceil correct values", () => {
    const cases = [
      { total: 0, limit: 0 },
      { total: 1, limit: 1 },
      { total: 2, limit: 1 },
      { total: 3, limit: 1 },
      { total: 4, limit: 2 },
      { total: 10, limit: 3 },
      { total: 15, limit: 5 },
      { total: 100, limit: 30 },
    ];

    cases.forEach(({ total, limit }) => {
      const resolvedLimit = Math.ceil(total * 0.3);
      expect(resolvedLimit).toBe(limit);
    });
  });

  it("applies 30% gating properly to an array of items", () => {
    const chapters = Array.from({ length: 10 }, (_, i) => ({
      id: `ch-${i + 1}`,
      title: `Chapter ${i + 1}`,
    }));

    const totalChapters = chapters.length;
    const freeLimit = Math.ceil(totalChapters * 0.3); // 3 chapters

    const gatedChapters = chapters.map((ch, idx) => {
      const isLocked = idx >= freeLimit;
      return {
        ...ch,
        isLocked,
      };
    });

    // First 3 chapters should be unlocked
    expect(gatedChapters.filter((c) => !c.isLocked)).toHaveLength(3);
    // Remaining 7 chapters should be locked
    expect(gatedChapters.filter((c) => c.isLocked)).toHaveLength(7);
  });
});
