import {
  DSA_GAMIFICATION_AWARDED_KEY,
  parseAwardedIdsFromStorageValue,
  serializeAwardedIds,
} from "@dsayatra/dsa-gamification-award";
import { describe, expect, it } from "vitest";

describe("dsaGamificationAward", () => {
  it("parses null and empty as empty set", () => {
    expect(parseAwardedIdsFromStorageValue(null).size).toBe(0);
    expect(parseAwardedIdsFromStorageValue("").size).toBe(0);
  });

  it("parses string ids from JSON array", () => {
    const set = parseAwardedIdsFromStorageValue(
      JSON.stringify(["q1", "q2", 3]),
    );
    expect([...set]).toEqual(["q1", "q2", "3"]);
  });

  it("returns empty set for invalid JSON or non-array", () => {
    expect(parseAwardedIdsFromStorageValue("not-json").size).toBe(0);
    expect(parseAwardedIdsFromStorageValue('{"x":1}').size).toBe(0);
  });

  it("serializes round-trip", () => {
    const a = new Set(["a", "b"]);
    const raw = serializeAwardedIds(a);
    expect(parseAwardedIdsFromStorageValue(raw)).toEqual(a);
  });

  it("uses stable storage key for product docs", () => {
    expect(DSA_GAMIFICATION_AWARDED_KEY).toBe(
      "dsayatra_gamification_awarded_questions",
    );
  });
});
