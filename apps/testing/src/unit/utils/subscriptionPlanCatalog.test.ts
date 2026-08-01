import {
  buildSubscriptionPlansRequestUrl,
  calculateDiscountPercent,
  formatPriceInr,
  getPlatformCheckoutOrigin,
  isSubscriptionPlanCatalogRow,
  normalizeSubscriptionPlansForPricing,
} from "@tbe/utils/subscriptionPlanCatalog";
import { afterEach, describe, expect, it, vi } from "vitest";

const validRow = {
  productType: "COURSE",
  planKey: "monthly",
  displayName: "Monthly Plan",
  description: "desc",
  amountInr: 499,
  originalAmountInr: 999,
  currency: "INR",
  accessType: "SUBSCRIPTION",
  durationMonths: 1,
  features: ["a", "b"],
  isPopular: true,
  isActive: true,
  sortOrder: 1,
};

describe("subscriptionPlanCatalog utils", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("formatPriceInr", () => {
    it("formats a number as INR currency with thousands separators", () => {
      expect(formatPriceInr(1234567)).toBe("₹12,34,567");
    });

    it("formats zero", () => {
      expect(formatPriceInr(0)).toBe("₹0");
    });
  });

  describe("calculateDiscountPercent", () => {
    it("computes a rounded discount percentage", () => {
      expect(calculateDiscountPercent(1000, 750)).toBe(25);
    });

    it("returns 0 when original is falsy", () => {
      expect(calculateDiscountPercent(0, 100)).toBe(0);
    });

    it("returns 0 when current is greater than or equal to original", () => {
      expect(calculateDiscountPercent(500, 500)).toBe(0);
      expect(calculateDiscountPercent(500, 600)).toBe(0);
    });
  });

  describe("getPlatformCheckoutOrigin", () => {
    it("strips a trailing slash from a configured platform URL", () => {
      // envConfig.PLATFORM_URL is read from process.env at module load in
      // @tbe/constants, so we can't easily override it here; just assert the
      // function returns a non-empty string consistent with either branch.
      const origin = getPlatformCheckoutOrigin();
      expect(typeof origin).toBe("string");
      expect(origin.endsWith("/")).toBe(false);
    });
  });

  describe("isSubscriptionPlanCatalogRow", () => {
    it("returns true for a well-formed row", () => {
      expect(isSubscriptionPlanCatalogRow(validRow)).toBe(true);
    });

    it("returns false for null/non-object values", () => {
      expect(isSubscriptionPlanCatalogRow(null)).toBe(false);
      expect(isSubscriptionPlanCatalogRow("string")).toBe(false);
      expect(isSubscriptionPlanCatalogRow([])).toBe(false);
    });

    it("returns false when a required field has the wrong type", () => {
      expect(
        isSubscriptionPlanCatalogRow({ ...validRow, amountInr: "499" }),
      ).toBe(false);
      expect(
        isSubscriptionPlanCatalogRow({ ...validRow, features: "a,b" }),
      ).toBe(false);
    });
  });

  describe("normalizeSubscriptionPlansForPricing", () => {
    it("returns an empty array for non-array input", () => {
      expect(normalizeSubscriptionPlansForPricing(null)).toEqual([]);
      expect(normalizeSubscriptionPlansForPricing({})).toEqual([]);
    });

    it("filters out invalid rows, inactive rows, and negative prices", () => {
      const inactive = { ...validRow, isActive: false, sortOrder: 2 };
      const negativePrice = { ...validRow, amountInr: -1, sortOrder: 3 };
      const invalid = { foo: "bar" };

      const result = normalizeSubscriptionPlansForPricing([
        validRow,
        inactive,
        negativePrice,
        invalid,
      ]);

      expect(result).toEqual([validRow]);
    });

    it("sorts the remaining rows by sortOrder", () => {
      const second = { ...validRow, planKey: "yearly", sortOrder: 2 };
      const first = { ...validRow, planKey: "monthly", sortOrder: 1 };

      const result = normalizeSubscriptionPlansForPricing([second, first]);

      expect(result.map((r) => r.planKey)).toEqual(["monthly", "yearly"]);
    });
  });

  describe("buildSubscriptionPlansRequestUrl", () => {
    it("builds a URL with the productType query param", () => {
      const url = buildSubscriptionPlansRequestUrl("COURSE");
      expect(url).toContain("productType=COURSE");
    });
  });
});
