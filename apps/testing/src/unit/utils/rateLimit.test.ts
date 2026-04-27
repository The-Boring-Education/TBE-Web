import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Must mock before importing
vi.mock("@/lib/constants", () => ({
  apiStatusCodes: {},
}));

vi.mock("@/lib/utils", () => ({
  sendAPIResponse: (obj: any) => obj,
}));

import {
  _resetRateLimitStore,
  rateLimit,
} from "../../../../api/src/lib/utils/rateLimit";

describe("rateLimit", () => {
  beforeEach(() => {
    _resetRateLimitStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    _resetRateLimitStore();
  });

  it("allows requests within the limit", () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      url: "/api/v1/test",
      headers: { "x-forwarded-for": "1.2.3.4" },
    });

    const result = rateLimit(req, res, {
      maxRequests: 5,
      windowMs: 60_000,
    });

    expect(result).toBe(true);
    expect(res._getStatusCode()).toBe(200); // not set to 429
  });

  it("blocks request when limit exceeded", () => {
    const opts = { maxRequests: 3, windowMs: 60_000 };

    for (let i = 0; i < 3; i++) {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        url: "/api/v1/test",
        headers: { "x-forwarded-for": "1.2.3.4" },
      });
      expect(rateLimit(req, res, opts)).toBe(true);
    }

    // 4th request should be blocked
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      url: "/api/v1/test",
      headers: { "x-forwarded-for": "1.2.3.4" },
    });
    const result = rateLimit(req, res, opts);

    expect(result).toBe(false);
    expect(res._getStatusCode()).toBe(429);
    const body = JSON.parse(res._getData());
    expect(body.message).toContain("Too many requests");
  });

  it("sets Retry-After header when rate limited", () => {
    const opts = { maxRequests: 1, windowMs: 60_000 };

    // First request OK
    const { req: req1, res: res1 } = createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      method: "POST",
      url: "/api/v1/test",
      headers: { "x-forwarded-for": "5.6.7.8" },
    });
    rateLimit(req1, res1, opts);

    // Second request blocked
    const { req: req2, res: res2 } = createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      method: "POST",
      url: "/api/v1/test",
      headers: { "x-forwarded-for": "5.6.7.8" },
    });
    rateLimit(req2, res2, opts);

    expect(res2.getHeader("Retry-After")).toBeDefined();
  });

  it("tracks different IPs independently", () => {
    const opts = { maxRequests: 1, windowMs: 60_000 };

    // IP A
    const { req: reqA, res: resA } = createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      method: "POST",
      url: "/api/v1/test",
      headers: { "x-forwarded-for": "10.0.0.1" },
    });
    expect(rateLimit(reqA, resA, opts)).toBe(true);

    // IP B (separate bucket)
    const { req: reqB, res: resB } = createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      method: "POST",
      url: "/api/v1/test",
      headers: { "x-forwarded-for": "10.0.0.2" },
    });
    expect(rateLimit(reqB, resB, opts)).toBe(true);

    // IP A again — should be blocked
    const { req: reqA2, res: resA2 } = createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      method: "POST",
      url: "/api/v1/test",
      headers: { "x-forwarded-for": "10.0.0.1" },
    });
    expect(rateLimit(reqA2, resA2, opts)).toBe(false);
  });

  it("supports custom key function", () => {
    const opts = {
      maxRequests: 1,
      windowMs: 60_000,
      keyFn: (req: NextApiRequest) => `user:${(req.body as any)?.userId}`,
    };

    const { req: req1, res: res1 } = createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      method: "POST",
      url: "/api/v1/test",
      body: { userId: "user_abc" },
    });
    expect(rateLimit(req1, res1, opts)).toBe(true);

    const { req: req2, res: res2 } = createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      method: "POST",
      url: "/api/v1/test",
      body: { userId: "user_abc" },
    });
    expect(rateLimit(req2, res2, opts)).toBe(false);
  });

  it("resets store clears all entries", () => {
    const opts = { maxRequests: 1, windowMs: 60_000 };

    const { req: req1, res: res1 } = createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      method: "POST",
      url: "/api/v1/test",
      headers: { "x-forwarded-for": "1.1.1.1" },
    });
    rateLimit(req1, res1, opts);

    _resetRateLimitStore();

    // After reset, same IP should be allowed again
    const { req: req2, res: res2 } = createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      method: "POST",
      url: "/api/v1/test",
      headers: { "x-forwarded-for": "1.1.1.1" },
    });
    expect(rateLimit(req2, res2, opts)).toBe(true);
  });
});
