import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

/* ------------------------------------------------------------------ */
/*  Mocks – must be declared before the handler import                */
/* ------------------------------------------------------------------ */

// Stub the withApiHandler wrapper so it passes the raw handler through
vi.mock("@/middleware/requestLogger", () => ({
  withApiHandler: (h: any) => h,
}));

// Stub DB connection
vi.mock("@/middleware/api", async () => {
  const actual: any = {};
  return {
    ...actual,
    connectDB: vi.fn(),
    adminMiddleware: vi.fn().mockResolvedValue(true),
  };
});

vi.mock("@/lib/utils/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/utils", () => ({
  sendAPIResponse: (obj: any) => obj,
}));

// The actual DB functions we'll control per-test
const mockGetAllCoupons = vi.fn();
const mockCreateCoupon = vi.fn();
const mockGetCouponById = vi.fn();
const mockUpdateCoupon = vi.fn();
const mockDeleteCoupon = vi.fn();
const mockApplyCouponToSheets = vi.fn();
const mockGetCouponByIdForBulk = vi.fn();

vi.mock("@/lib/database", () => ({
  getAllCouponsFromDB: (...args: any[]) => mockGetAllCoupons(...args),
  createCouponFromDB: (...args: any[]) => mockCreateCoupon(...args),
  getCouponByIdFromDB: (...args: any[]) => mockGetCouponById(...args),
  updateCouponFromDB: (...args: any[]) => mockUpdateCoupon(...args),
  deleteCouponFromDB: (...args: any[]) => mockDeleteCoupon(...args),
  applyCouponToSheetsFromDB: (...args: any[]) =>
    mockApplyCouponToSheets(...args),
}));

/* ------------------------------------------------------------------ */
/*  Import handlers (after mocks are registered)                       */
/* ------------------------------------------------------------------ */

import { adminMiddleware } from "@/middleware/api";

import couponIdHandler from "../../../../api/src/pages/api/v1/admin/coupon/[couponId]";
import bulkApplyHandler from "../../../../api/src/pages/api/v1/admin/coupon/[couponId]/bulk-apply";
import indexHandler from "../../../../api/src/pages/api/v1/admin/coupon/index";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const VALID_COUPON = {
  _id: "507f191e810c19729de860ea",
  code: "SAVE20",
  discountPercentage: 20,
  description: "Save 20%",
  isActive: true,
  expiryDate: new Date("2027-12-31"),
  maxUsage: 100,
  currentUsage: 5,
  minimumAmount: 0,
  applicableProducts: [],
  showOnPricingBanner: false,
  createdBy: "507f191e810c19729de860eb",
};

const futureDate = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
};

/* ================================================================== */
/*  GET / POST  /admin/coupon                                          */
/* ================================================================== */

describe("Admin Coupon Index – GET /admin/coupon", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all coupons", async () => {
    mockGetAllCoupons.mockResolvedValue({ data: [VALID_COUPON] });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      headers: { "x-admin-secret": "test-secret" },
    });
    await indexHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData());
    expect(body.data).toHaveLength(1);
    expect(body.data[0].code).toBe("SAVE20");
  });

  it("returns 500 when DB errors", async () => {
    mockGetAllCoupons.mockResolvedValue({ error: "DB down" });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      headers: { "x-admin-secret": "test-secret" },
    });
    await indexHandler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });

  it("rejects non-GET/POST methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "DELETE",
      headers: { "x-admin-secret": "test-secret" },
    });
    await indexHandler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it("rejects when admin middleware fails", async () => {
    (adminMiddleware as any).mockResolvedValueOnce(false);
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
    });
    await indexHandler(req, res);

    // adminMiddleware returns false → handler returns immediately
    // The middleware itself writes the 401 response in real usage
    expect(mockGetAllCoupons).not.toHaveBeenCalled();
  });
});

describe("Admin Coupon Index – POST /admin/coupon", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a coupon with valid data", async () => {
    mockCreateCoupon.mockResolvedValue({ data: VALID_COUPON });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: { "x-admin-secret": "test-secret" },
      body: {
        code: "SAVE20",
        discountPercentage: 20,
        description: "Save 20%",
        expiryDate: futureDate(),
      },
    });
    await indexHandler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(mockCreateCoupon).toHaveBeenCalledTimes(1);
  });

  it("rejects missing required fields", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: { "x-admin-secret": "test-secret" },
      body: { code: "SAVE20" }, // missing discountPercentage, description, expiryDate
    });
    await indexHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(mockCreateCoupon).not.toHaveBeenCalled();
  });

  it("rejects discount < 1", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: { "x-admin-secret": "test-secret" },
      body: {
        code: "BAD",
        discountPercentage: 0,
        description: "Bad",
        expiryDate: futureDate(),
      },
    });
    await indexHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it("rejects discount > 100", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: { "x-admin-secret": "test-secret" },
      body: {
        code: "BAD",
        discountPercentage: 101,
        description: "Bad",
        expiryDate: futureDate(),
      },
    });
    await indexHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it("rejects past expiry date", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: { "x-admin-secret": "test-secret" },
      body: {
        code: "OLD",
        discountPercentage: 10,
        description: "Old coupon",
        expiryDate: "2020-01-01",
      },
    });
    await indexHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it("handles duplicate code error from DB", async () => {
    mockCreateCoupon.mockResolvedValue({
      error: "Coupon with this code already exists",
    });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: { "x-admin-secret": "test-secret" },
      body: {
        code: "DUPE",
        discountPercentage: 10,
        description: "Dupe",
        expiryDate: futureDate(),
      },
    });
    await indexHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const body = JSON.parse(res._getData());
    expect(body.message).toContain("already exists");
  });

  it("uppercases and trims the code", async () => {
    mockCreateCoupon.mockResolvedValue({ data: VALID_COUPON });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: { "x-admin-secret": "test-secret" },
      body: {
        code: "  save20  ",
        discountPercentage: 20,
        description: "Save 20%",
        expiryDate: futureDate(),
      },
    });
    await indexHandler(req, res);

    expect(mockCreateCoupon).toHaveBeenCalledWith(
      expect.objectContaining({ code: "SAVE20" }),
    );
  });

  it("uses x-admin-user-id header for createdBy when provided", async () => {
    mockCreateCoupon.mockResolvedValue({ data: VALID_COUPON });
    const adminUserId = "507f191e810c19729de860ec";
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: {
        "x-admin-secret": "test-secret",
        "x-admin-user-id": adminUserId,
      },
      body: {
        code: "ADMIN",
        discountPercentage: 10,
        description: "Admin coupon",
        expiryDate: futureDate(),
      },
    });
    await indexHandler(req, res);

    expect(mockCreateCoupon).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: adminUserId }),
    );
  });
});

/* ================================================================== */
/*  GET / PUT / DELETE  /admin/coupon/:couponId                        */
/* ================================================================== */

describe("Admin Coupon [couponId] – GET", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a coupon by ID", async () => {
    mockGetCouponById.mockResolvedValue({ data: VALID_COUPON });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { couponId: "507f191e810c19729de860ea" },
    });
    await couponIdHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
  });

  it("returns 404 for missing coupon", async () => {
    mockGetCouponById.mockResolvedValue({ error: "Coupon not found" });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { couponId: "000000000000000000000000" },
    });
    await couponIdHandler(req, res);

    expect(res._getStatusCode()).toBe(404);
  });

  it("returns 400 when couponId is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {},
    });
    await couponIdHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });
});

describe("Admin Coupon [couponId] – PUT", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates coupon fields", async () => {
    mockUpdateCoupon.mockResolvedValue({
      data: { ...VALID_COUPON, discountPercentage: 30 },
    });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PUT",
      query: { couponId: "507f191e810c19729de860ea" },
      body: { discountPercentage: 30 },
    });
    await couponIdHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockUpdateCoupon).toHaveBeenCalledTimes(1);
  });

  it("rejects discount < 1 on update", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PUT",
      query: { couponId: "507f191e810c19729de860ea" },
      body: { discountPercentage: 0 },
    });
    await couponIdHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(mockUpdateCoupon).not.toHaveBeenCalled();
  });

  it("rejects discount > 100 on update", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PUT",
      query: { couponId: "507f191e810c19729de860ea" },
      body: { discountPercentage: 101 },
    });
    await couponIdHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it("returns error when coupon not found on update", async () => {
    mockUpdateCoupon.mockResolvedValue({ error: "Coupon not found" });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PUT",
      query: { couponId: "000000000000000000000000" },
      body: { description: "Updated" },
    });
    await couponIdHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });
});

describe("Admin Coupon [couponId] – DELETE", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes a coupon", async () => {
    mockDeleteCoupon.mockResolvedValue({ data: VALID_COUPON });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "DELETE",
      query: { couponId: "507f191e810c19729de860ea" },
    });
    await couponIdHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
  });

  it("returns 404 when coupon not found", async () => {
    mockDeleteCoupon.mockResolvedValue({ error: "Coupon not found" });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "DELETE",
      query: { couponId: "000000000000000000000000" },
    });
    await couponIdHandler(req, res);

    expect(res._getStatusCode()).toBe(404);
  });
});

describe("Admin Coupon [couponId] – unsupported method", () => {
  it("rejects PATCH", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      query: { couponId: "507f191e810c19729de860ea" },
    });
    await couponIdHandler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});

/* ================================================================== */
/*  POST  /admin/coupon/:couponId/bulk-apply                           */
/* ================================================================== */

describe("Admin Coupon Bulk Apply – POST", () => {
  beforeEach(() => vi.clearAllMocks());

  it("applies coupon to sheets", async () => {
    mockGetCouponById.mockResolvedValue({ data: VALID_COUPON });
    mockApplyCouponToSheets.mockResolvedValue({
      data: { ...VALID_COUPON, applicableProducts: ["sheet1", "sheet2"] },
    });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { couponId: "507f191e810c19729de860ea" },
      body: { sheetIds: ["sheet1", "sheet2"] },
    });
    await bulkApplyHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockApplyCouponToSheets).toHaveBeenCalledWith(
      "507f191e810c19729de860ea",
      ["sheet1", "sheet2"],
    );
  });

  it("rejects missing sheetIds", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { couponId: "507f191e810c19729de860ea" },
      body: {},
    });
    await bulkApplyHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it("rejects empty sheetIds array", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { couponId: "507f191e810c19729de860ea" },
      body: { sheetIds: [] },
    });
    await bulkApplyHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it("returns 404 when coupon not found", async () => {
    mockGetCouponById.mockResolvedValue({ error: "Coupon not found" });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { couponId: "000000000000000000000000" },
      body: { sheetIds: ["sheet1"] },
    });
    await bulkApplyHandler(req, res);

    expect(res._getStatusCode()).toBe(404);
  });

  it("rejects non-POST method", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { couponId: "507f191e810c19729de860ea" },
    });
    await bulkApplyHandler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it("rejects missing couponId", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: {},
      body: { sheetIds: ["sheet1"] },
    });
    await bulkApplyHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });
});
