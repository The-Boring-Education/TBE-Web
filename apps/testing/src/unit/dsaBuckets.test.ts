import { DSA_TIMELINE_TOPIC_CAPS, getDsaBucketCaps } from "@tbe/constants";
import { describe, expect, it } from "vitest";

import {
  applyDsaDurationBuckets,
  type DSASheetFilters,
  getEffectiveBucketCaps,
  resolveExperienceKey,
} from "../../../../apps/api/src/lib/database/queries/dsaSheet";

// Helper: create mock question rows
const mockQuestion = (
  id: string,
  topic: string,
  difficulty: "EASY" | "MEDIUM" | "HARD",
) => ({
  _id: id,
  topics: [topic],
  difficulty,
  _priorityScore: 0,
  _topicOrder: 0,
  _difficultyOrder: 0,
  order: 0,
  createdAt: new Date().toISOString(),
});

// Generate N questions per difficulty for a topic
const generateTopicQuestions = (
  topic: string,
  easyCount: number,
  medCount: number,
  hardCount: number,
) => {
  const rows: ReturnType<typeof mockQuestion>[] = [];
  for (let i = 0; i < easyCount; i++)
    rows.push(mockQuestion(`${topic}-easy-${i}`, topic, "EASY"));
  for (let i = 0; i < medCount; i++)
    rows.push(mockQuestion(`${topic}-med-${i}`, topic, "MEDIUM"));
  for (let i = 0; i < hardCount; i++)
    rows.push(mockQuestion(`${topic}-hard-${i}`, topic, "HARD"));
  return rows;
};

describe("getDsaBucketCaps", () => {
  it("returns null for unknown timeline", () => {
    expect(getDsaBucketCaps("2Weeks")).toBeNull();
  });

  it("returns caps that sum to timeline total for fresher", () => {
    const caps = getDsaBucketCaps("3Months", "fresher")!;
    expect(caps.EASY + caps.MEDIUM + caps.HARD).toBe(
      DSA_TIMELINE_TOPIC_CAPS["3Months"],
    );
  });

  it("returns caps that sum to timeline total for senior", () => {
    const caps = getDsaBucketCaps("1Year", "senior")!;
    expect(caps.EASY + caps.MEDIUM + caps.HARD).toBe(
      DSA_TIMELINE_TOPIC_CAPS["1Year"],
    );
  });

  it("guarantees at least 1 per difficulty", () => {
    const caps = getDsaBucketCaps("1Month", "senior")!;
    expect(caps.EASY).toBeGreaterThanOrEqual(1);
    expect(caps.MEDIUM).toBeGreaterThanOrEqual(1);
    expect(caps.HARD).toBeGreaterThanOrEqual(1);
  });

  it("fresher gets more EASY than HARD", () => {
    const caps = getDsaBucketCaps("6Months", "fresher")!;
    expect(caps.EASY).toBeGreaterThan(caps.HARD);
  });

  it("senior gets more HARD than EASY", () => {
    const caps = getDsaBucketCaps("6Months", "senior")!;
    expect(caps.HARD).toBeGreaterThan(caps.EASY);
  });

  it("different timelines yield different totals", () => {
    const oneMonth = getDsaBucketCaps("1Month", "fresher")!;
    const oneYear = getDsaBucketCaps("1Year", "fresher")!;
    const totalOneMonth = oneMonth.EASY + oneMonth.MEDIUM + oneMonth.HARD;
    const totalOneYear = oneYear.EASY + oneYear.MEDIUM + oneYear.HARD;
    expect(totalOneYear).toBeGreaterThan(totalOneMonth);
  });

  it("different experience levels yield different difficulty ratios", () => {
    const fresher = getDsaBucketCaps("6Months", "fresher")!;
    const senior = getDsaBucketCaps("6Months", "senior")!;
    // Same total (same timeline), different distribution
    expect(fresher.EASY + fresher.MEDIUM + fresher.HARD).toBe(
      senior.EASY + senior.MEDIUM + senior.HARD,
    );
    expect(fresher.EASY).toBeGreaterThan(senior.EASY);
    expect(senior.HARD).toBeGreaterThan(fresher.HARD);
  });
});

describe("resolveExperienceKey", () => {
  it("defaults to fresher when undefined", () => {
    expect(resolveExperienceKey(undefined)).toBe("fresher");
  });

  it("maps 'Fresher (0-1 yr)' to fresher", () => {
    expect(resolveExperienceKey("Fresher (0-1 yr)")).toBe("fresher");
  });

  it("maps 'Junior (1-3 yr)' to junior", () => {
    expect(resolveExperienceKey("Junior (1-3 yr)")).toBe("junior");
  });

  it("maps 'Mid (3-5 yr)' to mid", () => {
    expect(resolveExperienceKey("Mid (3-5 yr)")).toBe("mid");
  });

  it("maps 'Senior (5+ yrs)' to senior", () => {
    expect(resolveExperienceKey("Senior (5+ yrs)")).toBe("senior");
  });
});

describe("getEffectiveBucketCaps", () => {
  it("returns null when no duration", () => {
    expect(getEffectiveBucketCaps(undefined, "fresher", false)).toBeNull();
  });

  it("returns base caps for on-campus (offCampus=false)", () => {
    const caps = getEffectiveBucketCaps("3Months", "junior", false)!;
    const base = getDsaBucketCaps("3Months", "junior")!;
    expect(caps).toEqual(base);
  });

  it("scales ×1.5 for offCampus=true", () => {
    const caps = getEffectiveBucketCaps("3Months", "junior", true)!;
    const base = getDsaBucketCaps("3Months", "junior")!;
    expect(caps.EASY).toBe(Math.ceil(base.EASY * 1.5));
    expect(caps.MEDIUM).toBe(Math.ceil(base.MEDIUM * 1.5));
    expect(caps.HARD).toBe(Math.ceil(base.HARD * 1.5));
  });
});

describe("applyDsaDurationBuckets", () => {
  it("limits questions per difficulty to caps for a single topic", () => {
    // 10 EASY, 10 MEDIUM, 10 HARD for ARRAY
    const rows = generateTopicQuestions("ARRAY", 10, 10, 10);
    const filters: DSASheetFilters = {
      duration: "1Month",
      experienceLevel: "Fresher (0-1 yr)",
      offCampus: true,
    };
    const result = applyDsaDurationBuckets(
      rows as unknown as Record<string, unknown>[],
      filters,
      1,
      100,
    );
    const caps = getEffectiveBucketCaps("1Month", "Fresher (0-1 yr)", true)!;
    const total = caps.EASY + caps.MEDIUM + caps.HARD;
    expect(result.questions.length).toBe(total);
  });

  it("produces different counts for different timelines", () => {
    const rows = generateTopicQuestions("ARRAY", 10, 10, 10);
    const filtersShort: DSASheetFilters = {
      duration: "1Month",
      experienceLevel: "Fresher (0-1 yr)",
      offCampus: true,
    };
    const filtersLong: DSASheetFilters = {
      duration: "1Year",
      experienceLevel: "Fresher (0-1 yr)",
      offCampus: true,
    };
    const resultShort = applyDsaDurationBuckets(
      rows as unknown as Record<string, unknown>[],
      filtersShort,
      1,
      100,
    );
    const resultLong = applyDsaDurationBuckets(
      rows as unknown as Record<string, unknown>[],
      filtersLong,
      1,
      100,
    );
    expect(resultLong.questions.length).toBeGreaterThan(
      resultShort.questions.length,
    );
  });

  it("produces different difficulty distribution for different experience", () => {
    const rows = generateTopicQuestions("ARRAY", 10, 10, 10);
    const filtersFresher: DSASheetFilters = {
      duration: "6Months",
      experienceLevel: "Fresher (0-1 yr)",
      offCampus: false,
    };
    const filtersSenior: DSASheetFilters = {
      duration: "6Months",
      experienceLevel: "Senior (5+ yrs)",
      offCampus: false,
    };
    const resultFresher = applyDsaDurationBuckets(
      rows as unknown as Record<string, unknown>[],
      filtersFresher,
      1,
      100,
    );
    const resultSenior = applyDsaDurationBuckets(
      rows as unknown as Record<string, unknown>[],
      filtersSenior,
      1,
      100,
    );
    // Same total count (same timeline), different distribution
    expect(resultFresher.questions.length).toBe(resultSenior.questions.length);

    const countDifficulty = (qs: Record<string, unknown>[], diff: string) =>
      qs.filter((q) => q.difficulty === diff).length;

    const fresherEasy = countDifficulty(
      resultFresher.questions as Record<string, unknown>[],
      "EASY",
    );
    const seniorEasy = countDifficulty(
      resultSenior.questions as Record<string, unknown>[],
      "EASY",
    );
    const fresherHard = countDifficulty(
      resultFresher.questions as Record<string, unknown>[],
      "HARD",
    );
    const seniorHard = countDifficulty(
      resultSenior.questions as Record<string, unknown>[],
      "HARD",
    );

    expect(fresherEasy).toBeGreaterThan(seniorEasy);
    expect(seniorHard).toBeGreaterThan(fresherHard);
  });

  it("returns all rows when no duration is set (no caps)", () => {
    const rows = generateTopicQuestions("ARRAY", 5, 5, 5);
    const filters: DSASheetFilters = {
      offCampus: false,
    };
    const result = applyDsaDurationBuckets(
      rows as unknown as Record<string, unknown>[],
      filters,
      1,
      100,
    );
    expect(result.questions.length).toBe(15);
  });
});
