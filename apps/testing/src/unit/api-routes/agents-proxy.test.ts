import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAxios = vi.fn();
const mockEnsureAdminAccess = vi.fn();

vi.mock("axios", () => ({
  default: (...args: unknown[]) => mockAxios(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/lib/utils/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock("../../../../api/src/middleware/admin", () => ({
  withVerifiedAdminAuth:
    (
      wrapped: (
        req: NextApiRequest,
        res: NextApiResponse,
      ) => Promise<void> | void,
    ) =>
    async (req: NextApiRequest, res: NextApiResponse) => {
      const ok = await mockEnsureAdminAccess(req, res);
      if (!ok) return;
      return wrapped(req, res);
    },
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: <T>(h: T) => h,
}));

import handler from "../../../../api/src/pages/api/v1/agents-proxy/[...path]";

describe("Agents proxy /api/v1/agents-proxy/[...path]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnsureAdminAccess.mockResolvedValue(true);
    mockAxios.mockResolvedValue({ status: 200, data: { ok: true } });
  });

  it("denies unauthenticated requests and never calls the Agents service", async () => {
    mockEnsureAdminAccess.mockImplementation(
      async (_req: NextApiRequest, res: NextApiResponse) => {
        res.status(401).json({ status: false });
        return false;
      },
    );

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { path: ["quiz", "sessions"] },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(mockAxios).not.toHaveBeenCalled();
  });

  it("forwards an admin GET to the local Agents base by default", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { path: ["quiz", "sessions"] },
    });

    await handler(req, res);

    expect(mockAxios).toHaveBeenCalledTimes(1);
    const call = mockAxios.mock.calls[0][0];
    expect(call.url).toBe("http://localhost:8000/api/v1/quiz/sessions");
    expect(call.method).toBe("GET");
    // The platform Authorization must not leak to the Agents service.
    expect(call.headers.Authorization).toBeUndefined();
    expect(res._getStatusCode()).toBe(200);
  });

  it("maps x-agents-env=prod to the production Agents base", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { path: ["quiz", "generate"] },
      headers: { "x-agents-env": "prod" },
      body: { topic: "arrays" },
    });

    await handler(req, res);

    const call = mockAxios.mock.calls[0][0];
    expect(call.url).toBe(
      "https://tbe-agents-prod.vercel.app/api/v1/quiz/generate",
    );
    expect(call.data).toEqual({ topic: "arrays" });
  });

  it("strips the catch-all path param from forwarded query", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { path: ["sessions", "logs", "abc"], limit: "50" },
    });

    await handler(req, res);

    const call = mockAxios.mock.calls[0][0];
    expect(call.url).toBe("http://localhost:8000/api/v1/sessions/logs/abc");
    expect(call.params).toEqual({ limit: "50" });
    expect(call.params.path).toBeUndefined();
  });

  it("returns 502 when the Agents service is unreachable", async () => {
    mockAxios.mockRejectedValue(new Error("ECONNREFUSED"));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { path: ["ping"] },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(502);
  });
});
