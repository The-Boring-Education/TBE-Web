import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockVerifyToken = vi.fn();
const mockResolveOrderAmount = vi.fn();
const mockIsValidProductType = vi.fn();

vi.mock("../../../../api/src/lib/auth/jwt", () => ({
  verifyToken: (...args: unknown[]) => mockVerifyToken(...args),
}));

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    INTERNAL_SERVER_ERROR: 500,
    METHOD_NOT_ALLOWED: 405,
  },
}));

vi.mock("../../../../api/src/lib/constants/products", () => ({
  isValidProductType: (...args: unknown[]) => mockIsValidProductType(...args),
}));

vi.mock("../../../../api/src/lib/services/payment", () => ({
  resolveAuthoritativeOrderAmount: (...args: unknown[]) =>
    mockResolveOrderAmount(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: Record<string, unknown>) => payload,
}));

vi.mock("../../../../api/src/lib/utils/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), request: vi.fn() },
}));

vi.mock("../../../../api/src/lib/utils/sentry", () => ({
  captureAPIError: vi.fn(),
}));

vi.mock("../../../../api/src/lib/utils/cors", () => ({
  cors: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../api/src/middleware/api", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

import handler from "../../../../api/src/pages/api/v1/payment/quote";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const RESOLVED_QUOTE = {
  baseAmount: 999,
  finalAmount: 799,
  couponCode: "SAVE20",
  couponDescription: "Save 20%",
  couponDiscountPercentage: 20,
};

/* ================================================================== */
/*  Tests                                                              */
/* ================================================================== */

describe("Payment Quote API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsValidProductType.mockReturnValue(true);
  });

  // ---- Method validation ----

  it("rejects non-GET/POST methods (PUT)", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PUT",
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it("rejects DELETE method", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "DELETE",
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  // ---- Input validation ----

  it("returns 400 when productType is missing (GET)", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { productId: "prod_1" },
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it("returns 400 when productId is missing (GET)", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { productType: "SHIKSHA" },
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it("returns 400 for invalid productType", async () => {
    mockIsValidProductType.mockReturnValue(false);
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { productType: "INVALID", productId: "prod_1" },
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const body = JSON.parse(res._getData());
    expect(body.message).toContain("Invalid product type");
  });

  // ---- Anonymous quote (no auth) ----

  it("returns base price for anonymous GET (no coupon)", async () => {
    mockResolveOrderAmount.mockResolvedValue({
      ok: true,
      data: { baseAmount: 999, finalAmount: 999 },
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { productType: "SHIKSHA", productId: "prod_1" },
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData());
    expect(body.data.finalAmount).toBe(999);
  });

  it("returns discounted price with coupon (anonymous GET)", async () => {
    mockResolveOrderAmount.mockResolvedValue({
      ok: true,
      data: RESOLVED_QUOTE,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {
        productType: "SHIKSHA",
        productId: "prod_1",
        coupon: "SAVE20",
      },
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData());
    expect(body.data.finalAmount).toBe(799);
  });

  // ---- POST variant ----

  it("handles POST body input", async () => {
    mockResolveOrderAmount.mockResolvedValue({
      ok: true,
      data: { baseAmount: 999, finalAmount: 999 },
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { productType: "DSA_YATRA", productId: "lifetime" },
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
  });

  // ---- IDOR prevention (Phase 1.5 fix) ----

  it("returns 401 when userId is provided but no auth token", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {
        productType: "SHIKSHA",
        productId: "prod_1",
        userId: "user_abc",
      },
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    const body = JSON.parse(res._getData());
    expect(body.message).toContain("Authentication required");
  });

  it("returns 403 when userId doesn't match token", async () => {
    mockVerifyToken.mockReturnValue({ sub: "other_user" });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      headers: { authorization: "Bearer valid" },
      query: {
        productType: "SHIKSHA",
        productId: "prod_1",
        userId: "user_abc",
      },
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
  });

  it("allows authenticated quote with matching userId", async () => {
    mockVerifyToken.mockReturnValue({ sub: "user_abc" });
    mockResolveOrderAmount.mockResolvedValue({
      ok: true,
      data: { baseAmount: 999, finalAmount: 999 },
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      headers: { authorization: "Bearer valid" },
      query: {
        productType: "SHIKSHA",
        productId: "prod_1",
        userId: "user_abc",
      },
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
  });

  // ---- Error handling ----

  it("returns 400 when price resolution fails", async () => {
    mockResolveOrderAmount.mockResolvedValue({
      ok: false,
      error: "Product not found",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { productType: "SHIKSHA", productId: "nonexistent" },
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it("returns 500 on unexpected error", async () => {
    mockResolveOrderAmount.mockRejectedValue(new Error("Unexpected"));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { productType: "SHIKSHA", productId: "prod_1" },
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });

  // ---- Coupon passthrough ----

  it("passes coupon code to resolveAuthoritativeOrderAmount", async () => {
    mockResolveOrderAmount.mockResolvedValue({
      ok: true,
      data: RESOLVED_QUOTE,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {
        productType: "PREPYATRA",
        productId: "lifetime",
        coupon: "LAUNCH50",
      },
    });
    await handler(req, res);

    expect(mockResolveOrderAmount).toHaveBeenCalledWith(
      expect.objectContaining({ couponCode: "LAUNCH50" }),
    );
  });

  it("works without coupon parameter", async () => {
    mockResolveOrderAmount.mockResolvedValue({
      ok: true,
      data: { baseAmount: 999, finalAmount: 999 },
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { productType: "SHIKSHA", productId: "prod_1" },
    });
    await handler(req, res);

    expect(mockResolveOrderAmount).toHaveBeenCalledWith(
      expect.objectContaining({ couponCode: undefined }),
    );
  });
});
