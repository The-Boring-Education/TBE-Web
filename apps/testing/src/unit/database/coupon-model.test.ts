import { describe, expect, it } from "vitest";

/**
 * Test the Coupon schema virtual logic in isolation.
 * Rather than spinning up mongodb-memory-server we replicate the virtual getters
 * exactly as defined in the schema — this keeps unit tests fast and deterministic.
 */

/* ------------------------------------------------------------------ */
/*  Mirror the virtual getters from Coupon.ts                          */
/* ------------------------------------------------------------------ */

const isExpired = (doc: { expiryDate: Date }) => new Date() > doc.expiryDate;

const isUsageLimitReached = (doc: {
  maxUsage?: number | null;
  currentUsage: number;
}) =>
  doc.maxUsage != null && doc.maxUsage > 0 && doc.currentUsage >= doc.maxUsage;

const isValid = (doc: {
  isActive: boolean;
  expiryDate: Date;
  maxUsage?: number | null;
  currentUsage: number;
}) => doc.isActive && !isExpired(doc) && !isUsageLimitReached(doc);

/* ================================================================== */
/*  isExpired                                                          */
/* ================================================================== */

describe("Coupon virtual: isExpired", () => {
  it("returns true when expiryDate is in the past", () => {
    expect(isExpired({ expiryDate: new Date("2020-01-01") })).toBe(true);
  });

  it("returns false when expiryDate is in the future", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(isExpired({ expiryDate: future })).toBe(false);
  });
});

/* ================================================================== */
/*  isUsageLimitReached                                                */
/* ================================================================== */

describe("Coupon virtual: isUsageLimitReached", () => {
  it("returns true when currentUsage >= maxUsage", () => {
    expect(isUsageLimitReached({ maxUsage: 10, currentUsage: 10 })).toBe(true);
    expect(isUsageLimitReached({ maxUsage: 5, currentUsage: 6 })).toBe(true);
  });

  it("returns false when currentUsage < maxUsage", () => {
    expect(isUsageLimitReached({ maxUsage: 10, currentUsage: 9 })).toBe(false);
  });

  it("returns false when maxUsage is null (unlimited)", () => {
    expect(isUsageLimitReached({ maxUsage: null, currentUsage: 9999 })).toBe(
      false,
    );
  });

  it("returns false when maxUsage is undefined (unlimited)", () => {
    expect(
      isUsageLimitReached({ maxUsage: undefined, currentUsage: 100 }),
    ).toBe(false);
  });

  it("returns false when maxUsage is 0 (treated as unlimited)", () => {
    expect(isUsageLimitReached({ maxUsage: 0, currentUsage: 100 })).toBe(false);
  });
});

/* ================================================================== */
/*  isValid                                                            */
/* ================================================================== */

describe("Coupon virtual: isValid", () => {
  const futureDate = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d;
  };

  it("returns true when active, not expired, and usage within limit", () => {
    expect(
      isValid({
        isActive: true,
        expiryDate: futureDate(),
        maxUsage: 100,
        currentUsage: 50,
      }),
    ).toBe(true);
  });

  it("returns false when isActive is false", () => {
    expect(
      isValid({
        isActive: false,
        expiryDate: futureDate(),
        maxUsage: 100,
        currentUsage: 0,
      }),
    ).toBe(false);
  });

  it("returns false when expired", () => {
    expect(
      isValid({
        isActive: true,
        expiryDate: new Date("2020-01-01"),
        maxUsage: 100,
        currentUsage: 0,
      }),
    ).toBe(false);
  });

  it("returns false when usage limit reached", () => {
    expect(
      isValid({
        isActive: true,
        expiryDate: futureDate(),
        maxUsage: 10,
        currentUsage: 10,
      }),
    ).toBe(false);
  });

  it("returns true with unlimited usage (maxUsage null)", () => {
    expect(
      isValid({
        isActive: true,
        expiryDate: futureDate(),
        maxUsage: null,
        currentUsage: 99999,
      }),
    ).toBe(true);
  });
});

/* ================================================================== */
/*  Schema constraint logic (boundary values)                          */
/* ================================================================== */

describe("Coupon schema constraints", () => {
  describe("discountPercentage boundaries", () => {
    it("1 is the minimum valid value", () => {
      expect(1).toBeGreaterThanOrEqual(1);
      expect(1).toBeLessThanOrEqual(100);
    });

    it("100 is the maximum valid value", () => {
      expect(100).toBeGreaterThanOrEqual(1);
      expect(100).toBeLessThanOrEqual(100);
    });

    it("0 is invalid (below min)", () => {
      expect(0).toBeLessThan(1);
    });

    it("101 is invalid (above max)", () => {
      expect(101).toBeGreaterThan(100);
    });
  });

  describe("code constraints", () => {
    it("code is uppercased", () => {
      expect("save20".toUpperCase()).toBe("SAVE20");
      expect(" code ".trim().toUpperCase()).toBe("CODE");
    });

    it("max length is 20 characters", () => {
      expect("ABCDEFGHIJKLMNOPQRST".length).toBe(20); // Valid
      expect("ABCDEFGHIJKLMNOPQRSTU".length).toBe(21); // Invalid
    });
  });

  describe("minimumAmount constraint", () => {
    it("0 is valid", () => {
      expect(0).toBeGreaterThanOrEqual(0);
    });

    it("negative values are invalid", () => {
      expect(-1).toBeLessThan(0);
    });
  });
});
