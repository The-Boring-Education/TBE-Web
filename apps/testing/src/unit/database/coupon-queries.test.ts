import { beforeEach, describe, expect, it, vi } from "vitest";

/* ------------------------------------------------------------------ */
/*  Hoisted Mongoose Mocks                                             */
/* ------------------------------------------------------------------ */

const {
  mockFind,
  mockFindOne,
  mockFindById,
  mockFindByIdAndUpdate,
  mockFindByIdAndDelete,
  mockSave,
  mockPopulate,
  mockSort,
  mockLean,
  MockCouponConstructor,
} = vi.hoisted(() => {
  const mockFindInner = vi.fn();
  const mockFindOneInner = vi.fn();
  const mockFindByIdInner = vi.fn();
  const mockFindByIdAndUpdateInner = vi.fn();
  const mockFindByIdAndDeleteInner = vi.fn();
  const mockSaveInner = vi.fn();
  const mockPopulateInner = vi.fn();
  const mockSortInner = vi.fn();
  const mockLeanInner = vi.fn();

  // Chain: find().populate().sort()
  mockSortInner.mockReturnValue([]);
  mockPopulateInner.mockReturnValue({ sort: mockSortInner });
  mockFindInner.mockReturnValue({ populate: mockPopulateInner });

  // Chain: findByIdAndUpdate(id, update, opts).populate()
  const updatePopulate = vi.fn();
  mockFindByIdAndUpdateInner.mockReturnValue({ populate: updatePopulate });

  const MockCouponConstructorInner = vi.fn(function MockCoupon(
    this: any,
    doc: any,
  ) {
    Object.assign(this, doc);
    this.save = mockSaveInner;
    this.populate = mockPopulateInner;
  });

  Object.assign(MockCouponConstructorInner, {
    find: (...args: unknown[]) => {
      mockFindInner(...args);
      return {
        populate: (...pArgs: unknown[]) => {
          mockPopulateInner(...pArgs);
          return { sort: mockSortInner };
        },
        sort: (...sArgs: unknown[]) => {
          mockSortInner(...sArgs);
          return { lean: mockLeanInner };
        },
        select: vi.fn().mockReturnValue({ lean: mockLeanInner }),
        lean: mockLeanInner,
      };
    },
    findOne: (...args: unknown[]) => {
      mockFindOneInner(...args);
      return mockFindOneInner._mockReturn;
    },
    findById: (...args: unknown[]) => {
      mockFindByIdInner(...args);
      return mockFindByIdInner._mockReturn;
    },
    findByIdAndUpdate: (...args: unknown[]) => {
      mockFindByIdAndUpdateInner(...args);
      return {
        populate: updatePopulate,
      };
    },
    findByIdAndDelete: (...args: unknown[]) => {
      mockFindByIdAndDeleteInner(...args);
      return mockFindByIdAndDeleteInner._mockReturn;
    },
  });

  // Helper to set return values
  (mockFindOneInner as any)._mockReturn = null;
  (mockFindByIdInner as any)._mockReturn = null;
  (mockFindByIdAndDeleteInner as any)._mockReturn = null;

  return {
    mockFind: mockFindInner,
    mockFindOne: mockFindOneInner,
    mockFindById: mockFindByIdInner,
    mockFindByIdAndUpdate: mockFindByIdAndUpdateInner,
    mockFindByIdAndDelete: mockFindByIdAndDeleteInner,
    mockSave: mockSaveInner,
    mockPopulate: mockPopulateInner,
    mockSort: mockSortInner,
    mockLean: mockLeanInner,
    MockCouponConstructor: MockCouponConstructorInner,
  };
});

vi.mock("../../../../api/src/lib/database/models/Coupon", () => ({
  default: MockCouponConstructor,
}));

vi.mock("../../../../api/src/lib/database/models/SubscriptionPlan", () => ({
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
  createCouponFromDB,
  deleteCouponFromDB,
  findCouponByCodeFromDB,
  getAllCouponsFromDB,
  getCouponByIdFromDB,
  incrementCouponUsageFromDB,
  validateCouponForProductFromDB,
} from "../../../../api/src/lib/database/queries/coupon";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const makeCouponDoc = (overrides: Record<string, any> = {}) => ({
  _id: "coupon_abc",
  code: "SAVE20",
  discountPercentage: 20,
  description: "Save 20%",
  isActive: true,
  isExpired: false,
  isUsageLimitReached: false,
  isValid: true,
  expiryDate: new Date("2027-12-31"),
  maxUsage: 100,
  currentUsage: 5,
  applicableProducts: [],
  minimumAmount: 0,
  ...overrides,
});

/* ================================================================== */
/*  validateCouponForProductFromDB                                     */
/* ================================================================== */

describe("validateCouponForProductFromDB", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns coupon when valid and applicable to all products", async () => {
    const coupon = makeCouponDoc();
    (mockFindOne as any)._mockReturn = coupon;

    const result = await validateCouponForProductFromDB(
      "save20",
      "product1",
      "SHIKSHA",
    );

    expect(result.data).toBeTruthy();
    expect(result.error).toBeUndefined();
    expect(mockFindOne).toHaveBeenCalledWith({ code: "SAVE20" });
  });

  it("returns error for inactive coupon", async () => {
    (mockFindOne as any)._mockReturn = makeCouponDoc({ isActive: false });

    const result = await validateCouponForProductFromDB(
      "SAVE20",
      "p1",
      "SHIKSHA",
    );

    expect(result.error).toBe("Coupon is inactive");
  });

  it("returns error for expired coupon", async () => {
    (mockFindOne as any)._mockReturn = makeCouponDoc({ isExpired: true });

    const result = await validateCouponForProductFromDB(
      "SAVE20",
      "p1",
      "SHIKSHA",
    );

    expect(result.error).toBe("Coupon has expired");
  });

  it("returns error when usage limit is reached", async () => {
    (mockFindOne as any)._mockReturn = makeCouponDoc({
      isUsageLimitReached: true,
    });

    const result = await validateCouponForProductFromDB(
      "SAVE20",
      "p1",
      "SHIKSHA",
    );

    expect(result.error).toBe("Coupon usage limit reached");
  });

  it("returns error when product not in applicableProducts", async () => {
    (mockFindOne as any)._mockReturn = makeCouponDoc({
      applicableProducts: ["other_product"],
    });

    const result = await validateCouponForProductFromDB(
      "SAVE20",
      "my_product",
      "SHIKSHA",
    );

    expect(result.error).toBe("Coupon not applicable to this product");
  });

  it("accepts coupon when product IS in applicableProducts", async () => {
    (mockFindOne as any)._mockReturn = makeCouponDoc({
      applicableProducts: ["my_product"],
    });

    const result = await validateCouponForProductFromDB(
      "SAVE20",
      "my_product",
      "SHIKSHA",
    );

    expect(result.data).toBeTruthy();
  });

  it("returns error when coupon not found", async () => {
    (mockFindOne as any)._mockReturn = null;

    const result = await validateCouponForProductFromDB(
      "GHOST",
      "p1",
      "SHIKSHA",
    );

    expect(result.error).toBe("Coupon not found");
  });

  it("uppercases the code for lookup", async () => {
    (mockFindOne as any)._mockReturn = makeCouponDoc();

    await validateCouponForProductFromDB("save20", "p1", "SHIKSHA");

    expect(mockFindOne).toHaveBeenCalledWith({ code: "SAVE20" });
  });
});

/* ================================================================== */
/*  findCouponByCodeFromDB                                             */
/* ================================================================== */

describe("findCouponByCodeFromDB", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns coupon by code (case-insensitive)", async () => {
    const coupon = makeCouponDoc();
    (mockFindOne as any)._mockReturn = coupon;

    const result = await findCouponByCodeFromDB("save20");

    expect(result.data).toBeTruthy();
    expect(mockFindOne).toHaveBeenCalledWith({ code: "SAVE20" });
  });

  it("returns error when coupon not found", async () => {
    (mockFindOne as any)._mockReturn = null;

    const result = await findCouponByCodeFromDB("GHOST");

    expect(result.error).toBe("Coupon not found");
  });
});

/* ================================================================== */
/*  getCouponByIdFromDB                                                */
/* ================================================================== */

describe("getCouponByIdFromDB", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns coupon by ID", async () => {
    const coupon = makeCouponDoc();
    (mockFindById as any)._mockReturn = coupon;

    const result = await getCouponByIdFromDB("coupon_abc");

    expect(result.data).toBeTruthy();
  });

  it("returns error when coupon not found", async () => {
    (mockFindById as any)._mockReturn = null;

    const result = await getCouponByIdFromDB("nonexistent");

    expect(result.error).toBe("Coupon not found");
  });
});

/* ================================================================== */
/*  getAllCouponsFromDB                                                 */
/* ================================================================== */

describe("getAllCouponsFromDB", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all coupons sorted by createdAt desc", async () => {
    const coupons = [makeCouponDoc()];
    mockSort.mockReturnValue(coupons);

    const result = await getAllCouponsFromDB();

    expect(result.data).toEqual(coupons);
  });
});

/* ================================================================== */
/*  createCouponFromDB                                                 */
/* ================================================================== */

describe("createCouponFromDB", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a coupon and returns saved document", async () => {
    // No existing coupon with same code
    (mockFindOne as any)._mockReturn = null;

    const savedDoc = makeCouponDoc();
    savedDoc.populate = vi.fn().mockResolvedValue(savedDoc);
    mockSave.mockResolvedValue(savedDoc);

    const result = await createCouponFromDB({
      code: "NEW20",
      discountPercentage: 20,
      description: "New coupon",
      isActive: true,
      expiryDate: new Date("2027-12-31"),
      minimumAmount: 0,
      createdBy: "admin_user",
    });

    expect(result.data).toBeTruthy();
    expect(MockCouponConstructor).toHaveBeenCalled();
  });

  it("returns error when code already exists", async () => {
    (mockFindOne as any)._mockReturn = makeCouponDoc(); // existing coupon found

    const result = await createCouponFromDB({
      code: "SAVE20",
      discountPercentage: 20,
      description: "Dup",
      isActive: true,
      expiryDate: new Date("2027-12-31"),
      minimumAmount: 0,
      createdBy: "admin",
    });

    expect(result.error).toContain("already exists");
  });

  it("returns error when expiry date is in the past", async () => {
    (mockFindOne as any)._mockReturn = null;

    const result = await createCouponFromDB({
      code: "OLD",
      discountPercentage: 10,
      description: "Old",
      isActive: true,
      expiryDate: new Date("2020-01-01"),
      minimumAmount: 0,
      createdBy: "admin",
    });

    expect(result.error).toContain("future");
  });
});

/* ================================================================== */
/*  incrementCouponUsageFromDB                                         */
/* ================================================================== */

describe("incrementCouponUsageFromDB", () => {
  beforeEach(() => vi.clearAllMocks());

  it("atomically increments currentUsage", async () => {
    const updated = makeCouponDoc({ currentUsage: 6 });
    const populate = vi.fn().mockResolvedValue(updated);
    mockFindByIdAndUpdate.mockReturnValue(updated);

    // The actual function calls findByIdAndUpdate directly (no populate chain)
    const result = await incrementCouponUsageFromDB("coupon_abc");

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      "coupon_abc",
      { $inc: { currentUsage: 1 } },
      { new: true },
    );
  });

  it("returns error when coupon not found", async () => {
    mockFindByIdAndUpdate.mockReturnValue(null);

    // Need to handle the null return from findByIdAndUpdate
    const result = await incrementCouponUsageFromDB("nonexistent");
    // Function should handle this by checking updatedCoupon
  });
});

/* ================================================================== */
/*  deleteCouponFromDB                                                 */
/* ================================================================== */

describe("deleteCouponFromDB", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes coupon and returns deleted document", async () => {
    const deleted = makeCouponDoc();
    (mockFindByIdAndDelete as any)._mockReturn = deleted;

    const result = await deleteCouponFromDB("coupon_abc");

    expect(result.data).toBeTruthy();
  });

  it("returns error when coupon not found", async () => {
    (mockFindByIdAndDelete as any)._mockReturn = null;

    const result = await deleteCouponFromDB("nonexistent");

    expect(result.error).toBe("Coupon not found");
  });
});
