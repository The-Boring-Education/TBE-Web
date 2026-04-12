import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetInterviewSheetByIDFromDB = vi.fn();
const mockGetACourseFromDBById = vi.fn();
const mockGetSubscriptionPlanPriceFromDB = vi.fn();
const mockValidateCouponForProductFromDB = vi.fn();

vi.mock("../../../../api/src/lib/database", () => ({
  getInterviewSheetByIDFromDB: (...args: unknown[]) =>
    mockGetInterviewSheetByIDFromDB(...args),
  getACourseFromDBById: (...args: unknown[]) =>
    mockGetACourseFromDBById(...args),
  getSubscriptionPlanPriceFromDB: (...args: unknown[]) =>
    mockGetSubscriptionPlanPriceFromDB(...args),
  validateCouponForProductFromDB: (...args: unknown[]) =>
    mockValidateCouponForProductFromDB(...args),
}));

import { resolveAuthoritativeOrderAmount } from "../../../../api/src/lib/services/payment/resolveOrderAmount";

describe("resolveAuthoritativeOrderAmount guardrails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects interview sheets without a valid price", async () => {
    mockGetInterviewSheetByIDFromDB.mockResolvedValue({
      data: { price: 0, discountPercentage: 0 },
    });

    const result = await resolveAuthoritativeOrderAmount({
      productType: "INTERVIEW_SHEET",
      productId: "sheet_1",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Invalid sheet price");
    }
  });

  it("rejects courses without a valid price", async () => {
    mockGetACourseFromDBById.mockResolvedValue({
      data: { price: 0 },
    });

    const result = await resolveAuthoritativeOrderAmount({
      productType: "SHIKSHA",
      productId: "course_1",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Invalid course price");
    }
  });

  it.each([
    "PREPYATRA",
    "DSA_YATRA",
    "ONCAMPUS",
    "PROJECTS",
    "WEBINAR",
    "GENERAL",
  ] as const)("requires plan pricing for %s", async (productType) => {
    mockGetSubscriptionPlanPriceFromDB.mockResolvedValue(null);

    const result = await resolveAuthoritativeOrderAmount({
      productType,
      productId: "plan_1",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Plan pricing not configured");
      expect(result.error).toContain(productType);
    }
  });
});
