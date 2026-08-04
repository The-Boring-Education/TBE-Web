import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration test: Coupon lifecycle — exercises the full coupon lifecycle
 * from creation through usage to exhaustion, all through the query layer.
 *
 * Uses mocked Mongoose model to test query-layer integration without MongoDB.
 */

/* ------------------------------------------------------------------ */
/*  Hoisted Mocks (must be hoisted above vi.mock)                      */
/* ------------------------------------------------------------------ */

const {
  mockFindOne,
  mockFindById,
  mockFindByIdAndUpdate,
  mockFindOneAndUpdate,
  mockFindByIdAndDelete,
  MockCoupon,
} = vi.hoisted(() => {
  const mockFindOneInner = vi.fn();
  const mockFindByIdInner = vi.fn();
  const mockFindByIdAndUpdateInner = vi.fn();
  const mockFindOneAndUpdateInner = vi.fn();
  const mockFindByIdAndDeleteInner = vi.fn();
  const mockSaveInner = vi.fn();

  (mockFindOneInner as any)._result = null;
  (mockFindByIdInner as any)._result = null;
  (mockFindByIdAndUpdateInner as any)._result = null;
  (mockFindOneAndUpdateInner as any)._result = null;
  (mockFindByIdAndDeleteInner as any)._result = null;

  const MockCouponInner = vi.fn(function (this: any, doc: any) {
    Object.assign(this, doc);
    this.save = async () => {
      mockSaveInner(this);
      this.populate = async () => this;
      return this;
    };
    this.populate = async () => this;
  });

  Object.assign(MockCouponInner, {
    findOne: (...args: any[]) => {
      mockFindOneInner(...args);
      return (mockFindOneInner as any)._result;
    },
    findById: (...args: any[]) => {
      mockFindByIdInner(...args);
      return (mockFindByIdInner as any)._result;
    },
    findByIdAndUpdate: (...args: any[]) => {
      mockFindByIdAndUpdateInner(...args);
      return (mockFindByIdAndUpdateInner as any)._result;
    },
    findOneAndUpdate: (...args: any[]) => {
      mockFindOneAndUpdateInner(...args);
      return (mockFindOneAndUpdateInner as any)._result;
    },
    findByIdAndDelete: (...args: any[]) => {
      mockFindByIdAndDeleteInner(...args);
      return (mockFindByIdAndDeleteInner as any)._result;
    },
    find: vi.fn().mockReturnValue({
      populate: vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue([]),
      }),
    }),
  });

  return {
    mockFindOne: mockFindOneInner,
    mockFindById: mockFindByIdInner,
    mockFindByIdAndUpdate: mockFindByIdAndUpdateInner,
    mockFindOneAndUpdate: mockFindOneAndUpdateInner,
    mockFindByIdAndDelete: mockFindByIdAndDeleteInner,
    MockCoupon: MockCouponInner,
  };
});

vi.mock("@/lib/database/models/Coupon", () => ({
  default: MockCoupon,
}));

vi.mock("@/lib/database/models/SubscriptionPlan", () => ({
  default: {
    find: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue([]) }),
    }),
  },
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import {
  deleteCouponFromDB,
  incrementCouponUsageFromDB,
  validateCouponForProductFromDB,
} from "@/lib/database/queries/coupon";

/* ================================================================== */
/*  Tests                                                              */
/* ================================================================== */

describe("Coupon Lifecycle Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (mockFindOne as any)._result = null;
    (mockFindById as any)._result = null;
    (mockFindByIdAndUpdate as any)._result = null;
    (mockFindByIdAndDelete as any)._result = null;
  });

  it("lifecycle: validate → use → exhaust → delete", async () => {
    const couponDoc = {
      _id: "coupon_lifecycle",
      code: "LIFECYCLE10",
      discountPercentage: 10,
      description: "Lifecycle test",
      isActive: true,
      isExpired: false,
      isUsageLimitReached: false,
      isValid: true,
      expiryDate: new Date("2027-12-31"),
      maxUsage: 2,
      currentUsage: 0,
      applicableProducts: [],
      minimumAmount: 0,
    };

    // STEP 1: Validate coupon — should be valid
    (mockFindOne as any)._result = { ...couponDoc };

    const validateResult = await validateCouponForProductFromDB(
      "LIFECYCLE10",
      "product1",
      "SHIKSHA",
    );
    expect(validateResult.data).toBeTruthy();
    expect(validateResult.error).toBeUndefined();

    // STEP 2: Use coupon — increment usage
    const afterFirstUse = { ...couponDoc, currentUsage: 1 };
    (mockFindOneAndUpdate as any)._result = afterFirstUse;

    await incrementCouponUsageFromDB("coupon_lifecycle");
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ _id: "coupon_lifecycle" }),
      { $inc: { currentUsage: 1 } },
      { new: true },
    );

    // STEP 3: Use coupon again — second use
    const afterSecondUse = {
      ...couponDoc,
      currentUsage: 2,
      isUsageLimitReached: true,
    };
    (mockFindOneAndUpdate as any)._result = afterSecondUse;

    await incrementCouponUsageFromDB("coupon_lifecycle");

    // STEP 4: Validate again — should be exhausted
    (mockFindOne as any)._result = afterSecondUse;

    const exhaustedResult = await validateCouponForProductFromDB(
      "LIFECYCLE10",
      "product1",
      "SHIKSHA",
    );
    expect(exhaustedResult.error).toBe("Coupon usage limit reached");

    // STEP 5: Delete the coupon
    (mockFindByIdAndDelete as any)._result = couponDoc;

    const deleteResult = await deleteCouponFromDB("coupon_lifecycle");
    expect(deleteResult.data).toBeTruthy();
    expect(deleteResult.error).toBeUndefined();
  });

  it("inactive coupon is rejected on validate", async () => {
    (mockFindOne as any)._result = {
      _id: "coupon_inactive",
      code: "INACTIVE",
      isActive: false,
      isExpired: false,
      isUsageLimitReached: false,
    };

    const result = await validateCouponForProductFromDB(
      "INACTIVE",
      "p1",
      "SHIKSHA",
    );
    expect(result.error).toBe("Coupon is inactive");
  });

  it("expired coupon is rejected on validate", async () => {
    (mockFindOne as any)._result = {
      _id: "coupon_expired",
      code: "EXPIRED",
      isActive: true,
      isExpired: true,
      isUsageLimitReached: false,
    };

    const result = await validateCouponForProductFromDB(
      "EXPIRED",
      "p1",
      "SHIKSHA",
    );
    expect(result.error).toBe("Coupon has expired");
  });

  it("coupon restricted to specific product rejects other products", async () => {
    (mockFindOne as any)._result = {
      _id: "coupon_restricted",
      code: "RESTRICTED",
      isActive: true,
      isExpired: false,
      isUsageLimitReached: false,
      applicableProducts: ["product_A"],
    };

    const result = await validateCouponForProductFromDB(
      "RESTRICTED",
      "product_B",
      "SHIKSHA",
    );
    expect(result.error).toBe("Coupon not applicable to this product");
  });
});
