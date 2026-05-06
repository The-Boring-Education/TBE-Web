import { describe, expect, it } from "vitest";

import { parseDsaSheetGetQuery } from "../../../../api/src/lib/validation/dsaSheet";

const expectListFilters = (
  result: ReturnType<typeof parseDsaSheetGetQuery>,
) => {
  if (!result.ok || result.value.mode !== "list") {
    throw new Error("Expected parser to return list filters");
  }
  return result.value.filters;
};

const expectTopicsMode = (result: ReturnType<typeof parseDsaSheetGetQuery>) => {
  if (!result.ok || result.value.mode !== "topics") {
    throw new Error("Expected parser to return topics mode");
  }
  return result.value;
};

describe("parseDsaSheetGetQuery", () => {
  it("normalizes legacy duration and company aliases in list mode", () => {
    const parsed = parseDsaSheetGetQuery({
      duration: "4-6 months",
      companyType: "startup",
      topic: "array",
    });

    const filters = expectListFilters(parsed);
    expect(filters.duration).toBe("6Months");
    expect(filters.companyTypes).toEqual(["Startup"]);
    expect(filters.topics).toEqual(["ARRAY"]);
    expect(filters.productType).toBe("DSA_YATRA");
    expect(filters.offCampus).toBe(false);
    expect(filters.page).toBe(1);
  });

  it("injects ONCAMPUS baseline context in list mode", () => {
    const parsed = parseDsaSheetGetQuery({
      productType: "ONCAMPUS",
      topic: "array",
    });

    const filters = expectListFilters(parsed);
    expect(filters.productType).toBe("ONCAMPUS");
  });

  it("returns DSA_YATRA defaults for topics mode without explicit productType", () => {
    const parsed = parseDsaSheetGetQuery({ query: "topics" });
    const topics = expectTopicsMode(parsed);

    expect(topics.productType).toBe("DSA_YATRA");
    expect(topics.experienceLevel).toBeUndefined();
    expect(topics.offCampus).toBe(false);
    expect(topics.duration).toBeUndefined();
  });

  it("returns ONCAMPUS baseline for topics mode when requested", () => {
    const parsed = parseDsaSheetGetQuery({
      query: "topics",
      productType: "ONCAMPUS",
    });
    const topics = expectTopicsMode(parsed);

    expect(topics.productType).toBe("ONCAMPUS");
  });

  it("normalizes duration and offCampus in topics mode", () => {
    const parsed = parseDsaSheetGetQuery({
      query: "topics",
      duration: "4-6 months",
      offCampus: "true",
    });
    const topics = expectTopicsMode(parsed);

    expect(topics.duration).toBe("6Months");
    expect(topics.offCampus).toBe(true);
  });

  it("rejects invalid productType", () => {
    const parsed = parseDsaSheetGetQuery({ productType: "PREPYATRA" });

    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.message).toBe("Invalid productType");
    }
  });

  it("rejects invalid companyType aliases", () => {
    const parsed = parseDsaSheetGetQuery({ companyType: "enterprise" });

    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.message).toContain("Invalid companyType");
    }
  });

  it("rejects invalid duration in topics mode", () => {
    const parsed = parseDsaSheetGetQuery({
      query: "topics",
      duration: "9Months",
    });

    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.message).toBe("Invalid duration");
    }
  });
});
