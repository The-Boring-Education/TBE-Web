import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    INTERNAL_SERVER_ERROR: 500,
  },
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

import {
  matchesAdminSecret,
  verifyAdminSecret,
} from "../../../../api/src/middleware/adminSecret";

const SECRET = "a-sufficiently-long-admin-secret";

describe("verifyAdminSecret (fail-closed route guard)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_SECRET = SECRET;
  });

  afterEach(() => {
    delete process.env.ADMIN_SECRET;
  });

  it("responds 500 and denies when ADMIN_SECRET is unset (no fail-open)", () => {
    delete process.env.ADMIN_SECRET;

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      // Header also unset — the old `undefined === undefined` bug let this pass.
    });

    const ok = verifyAdminSecret(req, res);

    expect(ok).toBe(false);
    expect(res._getStatusCode()).toBe(500);
  });

  it("responds 500 when ADMIN_SECRET is an empty string", () => {
    process.env.ADMIN_SECRET = "";

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: { "x-admin-secret": "" },
    });

    expect(verifyAdminSecret(req, res)).toBe(false);
    expect(res._getStatusCode()).toBe(500);
  });

  it("responds 401 when the header is missing", () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
    });

    expect(verifyAdminSecret(req, res)).toBe(false);
    expect(res._getStatusCode()).toBe(401);
  });

  it("responds 401 when the header does not match", () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: { "x-admin-secret": "wrong-value-wrong-value" },
    });

    expect(verifyAdminSecret(req, res)).toBe(false);
    expect(res._getStatusCode()).toBe(401);
  });

  it("returns true on an exact match", () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: { "x-admin-secret": SECRET },
    });

    expect(verifyAdminSecret(req, res)).toBe(true);
  });
});

describe("matchesAdminSecret (non-fatal check)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_SECRET = SECRET;
  });

  afterEach(() => {
    delete process.env.ADMIN_SECRET;
  });

  it("returns false when ADMIN_SECRET is unset", () => {
    delete process.env.ADMIN_SECRET;
    const { req } = createMocks<NextApiRequest, NextApiResponse>({
      headers: { "x-admin-secret": SECRET },
    });
    expect(matchesAdminSecret(req)).toBe(false);
  });

  it("returns false when the header is missing", () => {
    const { req } = createMocks<NextApiRequest, NextApiResponse>({});
    expect(matchesAdminSecret(req)).toBe(false);
  });

  it("returns false on mismatch", () => {
    const { req } = createMocks<NextApiRequest, NextApiResponse>({
      headers: { "x-admin-secret": "nope" },
    });
    expect(matchesAdminSecret(req)).toBe(false);
  });

  it("returns true on an exact match", () => {
    const { req } = createMocks<NextApiRequest, NextApiResponse>({
      headers: { "x-admin-secret": SECRET },
    });
    expect(matchesAdminSecret(req)).toBe(true);
  });
});
