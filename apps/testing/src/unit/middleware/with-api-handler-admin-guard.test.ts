import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The admin guard is declared on `withApiHandler`, so every route that opts in
 * gets the same 401/403 behaviour, Sentry reporting and method scoping.
 */

vi.mock("@/lib/utils/cors", () => ({ cors: vi.fn() }));
vi.mock("@/middleware/api", () => ({ connectDB: vi.fn() }));

vi.mock("@/lib/utils/functions", () => ({
  sendAPIResponse: (payload: Record<string, unknown>) => payload,
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    request: vi.fn(),
  },
}));

const mockCaptureAuthError = vi.fn();
vi.mock("@/lib/utils/sentry", () => ({
  captureAuthError: (...args: unknown[]) => mockCaptureAuthError(...args),
  captureAPIError: vi.fn(),
}));

const mockEnsureAdminAccess = vi.fn();
const mockEnsureAdminAccessOrSecret = vi.fn();
vi.mock("@/middleware/admin", () => ({
  ensureAdminAccess: (...args: unknown[]) => mockEnsureAdminAccess(...args),
  ensureAdminAccessOrSecret: (...args: unknown[]) =>
    mockEnsureAdminAccessOrSecret(...args),
}));

import { withApiHandler } from "@/middleware/requestLogger";

const run = async (
  handler: (req: NextApiRequest, res: NextApiResponse) => unknown,
  method: string,
) => {
  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
    method: method as "GET",
  });
  await handler(req, res);
  return res;
};

describe("withApiHandler admin guard", () => {
  const routeHandler = vi.fn(
    async (_req: NextApiRequest, res: NextApiResponse) => {
      res.status(200).json({ status: true });
    },
  );

  beforeEach(() => {
    vi.clearAllMocks();
    mockEnsureAdminAccess.mockResolvedValue(true);
    mockEnsureAdminAccessOrSecret.mockResolvedValue(true);
  });

  it("does not guard routes that omit the admin option", async () => {
    await run(withApiHandler(routeHandler), "POST");

    expect(mockEnsureAdminAccess).not.toHaveBeenCalled();
    expect(routeHandler).toHaveBeenCalled();
  });

  it("guards only the declared methods", async () => {
    const guarded = withApiHandler(routeHandler, {
      admin: { methods: ["POST"] },
    });

    await run(guarded, "GET");
    expect(mockEnsureAdminAccess).not.toHaveBeenCalled();

    await run(guarded, "POST");
    expect(mockEnsureAdminAccess).toHaveBeenCalled();
  });

  it("guards every method when no methods are listed", async () => {
    const guarded = withApiHandler(routeHandler, { admin: {} });

    await run(guarded, "GET");

    expect(mockEnsureAdminAccess).toHaveBeenCalled();
  });

  it("skips the handler and reports to Sentry when the guard denies", async () => {
    mockEnsureAdminAccess.mockResolvedValue(false);

    await run(withApiHandler(routeHandler, { admin: {} }), "POST");

    expect(routeHandler).not.toHaveBeenCalled();
    expect(mockCaptureAuthError).toHaveBeenCalled();
  });

  it("uses the secret-aware guard when allowSecret is set", async () => {
    await run(
      withApiHandler(routeHandler, { admin: { allowSecret: true } }),
      "POST",
    );

    expect(mockEnsureAdminAccessOrSecret).toHaveBeenCalled();
    expect(mockEnsureAdminAccess).not.toHaveBeenCalled();
  });
});
