import { CACHE_TIMES, type CacheTier } from "@tbe/query";
import { describe, expect, it } from "vitest";

describe("CACHE_TIMES", () => {
  it("should have all five tiers defined", () => {
    const tiers: CacheTier[] = [
      "STATIC",
      "STABLE",
      "STANDARD",
      "DYNAMIC",
      "REALTIME",
    ];
    tiers.forEach((tier) => {
      expect(CACHE_TIMES[tier]).toBeDefined();
      expect(CACHE_TIMES[tier]).toHaveProperty("staleTime");
      expect(CACHE_TIMES[tier]).toHaveProperty("gcTime");
    });
  });

  it("should have staleTime less than or equal to gcTime for every tier", () => {
    for (const tier of Object.values(CACHE_TIMES)) {
      expect(tier.staleTime).toBeLessThanOrEqual(tier.gcTime);
    }
  });

  it("should have decreasing staleTime from STATIC to REALTIME", () => {
    expect(CACHE_TIMES.STATIC.staleTime).toBeGreaterThan(
      CACHE_TIMES.STABLE.staleTime,
    );
    expect(CACHE_TIMES.STABLE.staleTime).toBeGreaterThan(
      CACHE_TIMES.STANDARD.staleTime,
    );
    expect(CACHE_TIMES.STANDARD.staleTime).toBeGreaterThan(
      CACHE_TIMES.DYNAMIC.staleTime,
    );
    expect(CACHE_TIMES.DYNAMIC.staleTime).toBeGreaterThan(
      CACHE_TIMES.REALTIME.staleTime,
    );
  });

  it("STATIC should cache for 30 minutes stale, 1 hour gc", () => {
    expect(CACHE_TIMES.STATIC.staleTime).toBe(30 * 60 * 1000);
    expect(CACHE_TIMES.STATIC.gcTime).toBe(60 * 60 * 1000);
  });

  it("STABLE should cache for 15 minutes stale, 30 minutes gc", () => {
    expect(CACHE_TIMES.STABLE.staleTime).toBe(15 * 60 * 1000);
    expect(CACHE_TIMES.STABLE.gcTime).toBe(30 * 60 * 1000);
  });

  it("STANDARD should cache for 5 minutes stale, 10 minutes gc", () => {
    expect(CACHE_TIMES.STANDARD.staleTime).toBe(5 * 60 * 1000);
    expect(CACHE_TIMES.STANDARD.gcTime).toBe(10 * 60 * 1000);
  });

  it("DYNAMIC should cache for 30 seconds stale, 5 minutes gc", () => {
    expect(CACHE_TIMES.DYNAMIC.staleTime).toBe(30 * 1000);
    expect(CACHE_TIMES.DYNAMIC.gcTime).toBe(5 * 60 * 1000);
  });

  it("REALTIME should have 0 staleTime and 1 minute gc", () => {
    expect(CACHE_TIMES.REALTIME.staleTime).toBe(0);
    expect(CACHE_TIMES.REALTIME.gcTime).toBe(60 * 1000);
  });

  it("all values should be non-negative numbers", () => {
    for (const tier of Object.values(CACHE_TIMES)) {
      expect(tier.staleTime).toBeGreaterThanOrEqual(0);
      expect(tier.gcTime).toBeGreaterThanOrEqual(0);
      expect(typeof tier.staleTime).toBe("number");
      expect(typeof tier.gcTime).toBe("number");
    }
  });
});
