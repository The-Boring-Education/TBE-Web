import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  adminGuardMock,
  withApiHandlerMock,
} from "../../test-utils/api-handler-mock";

const reorder = vi.hoisted(() => vi.fn());
vi.mock("@/lib/database", () => ({ reorderContentInDB: reorder }));
vi.mock("@/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));
vi.mock("@/lib/utils/sentry", () => ({ captureAPIError: vi.fn() }));
vi.mock("@/middleware/requestLogger", () => ({
  withApiHandler: (...args: Parameters<typeof withApiHandlerMock>) =>
    withApiHandlerMock(...args),
}));

import handler from "@api/pages/api/v1/admin/content-order";

const payload = {
  contentType: "course-chapters",
  parentId: "507f1f77bcf86cd799439011",
  previousIds: ["one", "two"],
  orderedIds: ["two", "one"],
};

const run = async (
  body: unknown = payload,
  method: "PATCH" | "GET" = "PATCH",
) => {
  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
    method,
    body,
  });
  await handler(req, res);
  return res;
};

describe("Admin content order route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminGuardMock.mockResolvedValue(true);
    reorder.mockResolvedValue({ data: { orderedIds: payload.orderedIds } });
  });

  it.each([401, 403])(
    "rejects unauthorized callers with %s",
    async (status) => {
      adminGuardMock.mockImplementation(async (_req, res) => {
        res.status(status).json({ status: false });
        return false;
      });
      expect((await run())._getStatusCode()).toBe(status);
      expect(reorder).not.toHaveBeenCalled();
    },
  );

  it("rejects unsupported methods", async () => {
    expect((await run(payload, "GET"))._getStatusCode()).toBe(405);
    expect(reorder).not.toHaveBeenCalled();
  });

  it.each([
    null,
    {},
    { ...payload, contentType: "other" },
    { ...payload, parentId: "invalid" },
    { ...payload, previousIds: ["one", "one"] },
    { ...payload, orderedIds: ["two", "two"] },
    { ...payload, orderedIds: ["one"] },
    { ...payload, orderedIds: ["one", "foreign"] },
    { ...payload, orderedIds: ["one", 2] },
    { ...payload, orderedIds: ["one", ""] },
    { ...payload, previousIds: "one,two" },
    { ...payload, extra: "unexpected" },
  ])("rejects malformed or non-permutation payloads: %j", async (body) => {
    const res = await run(body);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().status).toBe(false);
    expect(reorder).not.toHaveBeenCalled();
  });

  it.each(["course-chapters", "interview-questions", "project-sections"])(
    "saves %s",
    async (contentType) => {
      const body = { ...payload, contentType };
      const res = await run(body);
      expect(reorder).toHaveBeenCalledWith(body);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toMatchObject({
        status: true,
        data: { orderedIds: ["two", "one"] },
      });
    },
  );

  it.each([404, 409, 500])(
    "surfaces persistence errors with %s",
    async (statusCode) => {
      reorder.mockResolvedValue({ error: "Cannot reorder", statusCode });
      const res = await run();
      expect(res._getStatusCode()).toBe(statusCode);
      expect(res._getJSONData()).toMatchObject({
        status: false,
        message: "Cannot reorder",
      });
    },
  );
});
