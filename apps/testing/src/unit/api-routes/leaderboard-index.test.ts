import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetLeaderboardBoard = vi.fn();
const mockGetPeriodChampions = vi.fn();
const mockClosePeriod = vi.fn();
const mockVerifyAuthenticatedUser = vi.fn();
const mockEnsureAdmin = vi.fn();
const mockAuthUserId = vi.fn<() => string | null>();
const mockUserFindByIdAndUpdate = vi.fn();
const mockUserUpdateOne = vi.fn();
const mockVerifyToken = vi.fn();

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    INTERNAL_SERVER_ERROR: 500,
  },
}));

vi.mock("../../../../api/src/lib/database", () => {
  class PeriodCloseError extends Error {
    constructor(
      message: string,
      public code: string,
    ) {
      super(message);
    }
  }
  return {
    getLeaderboardBoard: (...a: unknown[]) => mockGetLeaderboardBoard(...a),
    getPeriodChampions: (...a: unknown[]) => mockGetPeriodChampions(...a),
    resolvePeriodKey: (_t: string, key: unknown) =>
      key === undefined ? "2026-W39" : key === "2026-W38" ? key : null,
    closePeriod: (...a: unknown[]) => mockClosePeriod(...a),
    PeriodCloseError,
    invalidateHiddenLearnerCache: vi.fn(),
    User: {
      findByIdAndUpdate: (...a: unknown[]) => ({
        lean: () => mockUserFindByIdAndUpdate(...a),
      }),
      updateOne: (...a: unknown[]) => mockUserUpdateOne(...a),
    },
  };
});

vi.mock("../../../../api/src/lib/services/leaderboardEmail", () => ({
  sendLeaderboardTopFinishEmail: vi.fn(),
  verifyLeaderboardUnsubscribeToken: (t: unknown) => mockVerifyToken(t),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (fn: unknown) => fn,
}));

vi.mock("../../../../api/src/middleware/admin", () => ({
  verifyAuthenticatedUser: () => mockVerifyAuthenticatedUser(),
  ensureAdminAccessOrSecret: async (_req: unknown, res: NextApiResponse) => {
    const ok = mockEnsureAdmin();
    if (!ok) res.status(401).json({ message: "Unauthorized" });
    return ok;
  },
}));

vi.mock("../../../../api/src/middleware/userAuth", () => ({
  getAuthenticatedUserId: (_req: unknown, res: NextApiResponse) => {
    const id = mockAuthUserId();
    if (!id) res.status(401).json({ message: "Authentication required" });
    return id;
  },
}));

import championsHandler from "../../../../api/src/pages/api/v1/leaderboard/champions";
import closeHandler from "../../../../api/src/pages/api/v1/leaderboard/close-period";
import boardHandler from "../../../../api/src/pages/api/v1/leaderboard/index";
import publicHandler from "../../../../api/src/pages/api/v1/leaderboard/public";
import unsubscribeHandler from "../../../../api/src/pages/api/v1/leaderboard/unsubscribe";
import preferencesHandler from "../../../../api/src/pages/api/v1/user/leaderboard-preferences";

const call = async (
  handler: (req: NextApiRequest, res: NextApiResponse) => unknown,
  opts: Parameters<typeof createMocks>[0],
) => {
  const { req, res } = createMocks<NextApiRequest, NextApiResponse>(opts);
  await handler(req, res);
  return res;
};

const board = { type: "WEEKLY", periodKey: "2026-W39", entries: [] };

describe("GET /leaderboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetLeaderboardBoard.mockResolvedValue(board);
  });

  it("rejects other methods (405) and bad types (400)", async () => {
    expect(
      (await call(boardHandler, { method: "POST" }))._getStatusCode(),
    ).toBe(405);
    const res = await call(boardHandler, {
      method: "GET",
      query: { type: "YEARLY" },
    });
    expect(res._getStatusCode()).toBe(400);
  });

  it("rejects an invalid periodKey (400)", async () => {
    const res = await call(boardHandler, {
      method: "GET",
      query: { type: "WEEKLY", periodKey: "{$gt:''}" },
    });
    expect(res._getStatusCode()).toBe(400);
    expect(mockGetLeaderboardBoard).not.toHaveBeenCalled();
  });

  it("serves anonymous callers the masked public board from the CDN cache", async () => {
    mockVerifyAuthenticatedUser.mockReturnValue(null);
    const res = await call(boardHandler, {
      method: "GET",
      query: { type: "WEEKLY", limit: "10" },
    });

    expect(res._getStatusCode()).toBe(200);
    expect(res.getHeader("Cache-Control")).toContain("s-maxage=30");
    expect(mockGetLeaderboardBoard).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "WEEKLY",
        periodKey: "2026-W39",
        limit: 10,
        viewerId: undefined,
        audience: "public",
      }),
    );
  });

  it("includes the viewer's standing privately when signed in", async () => {
    mockVerifyAuthenticatedUser.mockReturnValue({ sub: "me" });
    const res = await call(boardHandler, {
      method: "GET",
      query: { type: "DAILY" },
    });

    expect(res.getHeader("Cache-Control")).toBe("private, no-store");
    expect(mockGetLeaderboardBoard).toHaveBeenCalledWith(
      expect.objectContaining({
        viewerId: "me",
        type: "DAILY",
        audience: "member",
      }),
    );
  });
});

describe("GET /leaderboard/public", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetLeaderboardBoard.mockResolvedValue(board);
  });

  it("uses the public audience, defaults to WEEKLY and caps the limit", async () => {
    const res = await call(publicHandler, {
      method: "GET",
      query: { limit: "500" },
    });

    expect(res._getStatusCode()).toBe(200);
    expect(res.getHeader("Cache-Control")).toContain("s-maxage=60");
    expect(mockGetLeaderboardBoard).toHaveBeenCalledWith({
      type: "WEEKLY",
      limit: 10,
      audience: "public",
    });
  });
});

describe("POST /leaderboard/close-period", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClosePeriod.mockImplementation(async ({ type, periodKey }) => ({
      type,
      periodKey,
      sent: 0,
    }));
  });

  it("requires admin access", async () => {
    mockEnsureAdmin.mockReturnValue(false);
    const res = await call(closeHandler, { method: "POST", body: {} });
    expect(res._getStatusCode()).toBe(401);
    expect(mockClosePeriod).not.toHaveBeenCalled();
  });

  it("closes the previous Period of every type when no type is given", async () => {
    mockEnsureAdmin.mockReturnValue(true);
    const res = await call(closeHandler, { method: "POST", body: {} });

    expect(res._getStatusCode()).toBe(200);
    expect(mockClosePeriod.mock.calls.map(([arg]) => arg.type)).toEqual([
      "DAILY",
      "WEEKLY",
      "MONTHLY",
    ]);
  });

  it("closes one explicit Period", async () => {
    mockEnsureAdmin.mockReturnValue(true);
    await call(closeHandler, {
      method: "POST",
      body: { type: "WEEKLY", periodKey: "2026-W38" },
    });
    expect(mockClosePeriod).toHaveBeenCalledTimes(1);
    expect(mockClosePeriod.mock.calls[0]![0]).toMatchObject({
      type: "WEEKLY",
      periodKey: "2026-W38",
    });
  });

  it("validates input and maps Period Close errors to 400", async () => {
    mockEnsureAdmin.mockReturnValue(true);
    expect(
      (
        await call(closeHandler, { method: "POST", body: { type: "X" } })
      )._getStatusCode(),
    ).toBe(400);
    expect(
      (
        await call(closeHandler, {
          method: "POST",
          body: { periodKey: "2026-W38" },
        })
      )._getStatusCode(),
    ).toBe(400);

    const { PeriodCloseError } =
      await import("../../../../api/src/lib/database");
    mockClosePeriod.mockRejectedValue(
      new (PeriodCloseError as unknown as new (m: string, c: string) => Error)(
        "not ended",
        "PERIOD_NOT_ENDED",
      ),
    );
    const res = await call(closeHandler, {
      method: "POST",
      body: { type: "DAILY" },
    });
    expect(res._getStatusCode()).toBe(400);
  });
});

describe("PATCH /user/leaderboard-preferences", () => {
  beforeEach(() => vi.clearAllMocks());

  it("requires authentication", async () => {
    mockAuthUserId.mockReturnValue(null);
    const res = await call(preferencesHandler, {
      method: "PATCH",
      body: { visible: false },
    });
    expect(res._getStatusCode()).toBe(401);
  });

  it("updates visibility and email preferences but never exclusion", async () => {
    mockAuthUserId.mockReturnValue("me");
    mockUserFindByIdAndUpdate.mockResolvedValue({
      leaderboard: { visible: false, emails: true, excluded: false },
    });

    const res = await call(preferencesHandler, {
      method: "PATCH",
      body: { visible: false, excluded: false, emails: "yes" },
    });

    expect(res._getStatusCode()).toBe(200);
    expect(mockUserFindByIdAndUpdate).toHaveBeenCalledWith(
      "me",
      { $set: { "leaderboard.visible": false } },
      expect.anything(),
    );
    expect(JSON.parse(res._getData()).data).toEqual({
      visible: false,
      emails: true,
      excluded: false,
    });
  });

  it("rejects a body with nothing to change", async () => {
    mockAuthUserId.mockReturnValue("me");
    const res = await call(preferencesHandler, { method: "PATCH", body: {} });
    expect(res._getStatusCode()).toBe(400);
  });
});

describe("GET /leaderboard/unsubscribe", () => {
  beforeEach(() => vi.clearAllMocks());

  it("turns off leaderboard emails for a valid token", async () => {
    mockVerifyToken.mockReturnValue("64b7f0c2a1b2c3d4e5f60718");
    const res = await call(unsubscribeHandler, {
      method: "GET",
      query: { token: "valid" },
    });
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toContain("unsubscribed");
    expect(mockUserUpdateOne).toHaveBeenCalledWith(
      { _id: "64b7f0c2a1b2c3d4e5f60718" },
      { $set: { "leaderboard.emails": false } },
    );
  });

  it("changes nothing for an invalid token", async () => {
    mockVerifyToken.mockReturnValue(null);
    const res = await call(unsubscribeHandler, {
      method: "GET",
      query: { token: "forged" },
    });
    expect(res._getStatusCode()).toBe(400);
    expect(mockUserUpdateOne).not.toHaveBeenCalled();
  });
});

describe("GET /leaderboard/champions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPeriodChampions.mockResolvedValue(null);
  });

  it("gives anonymous callers the masked public Champions, CDN-cached", async () => {
    mockVerifyAuthenticatedUser.mockReturnValue(null);
    const res = await call(championsHandler, {
      method: "GET",
      query: { type: "WEEKLY" },
    });

    expect(res._getStatusCode()).toBe(200);
    expect(res.getHeader("Cache-Control")).toContain("public");
    expect(mockGetPeriodChampions.mock.calls[0]![3]).toBe("public");
  });

  it("gives signed-in learners full Champions privately", async () => {
    mockVerifyAuthenticatedUser.mockReturnValue({ sub: "me" });
    const res = await call(championsHandler, {
      method: "GET",
      query: { type: "WEEKLY" },
    });

    expect(res.getHeader("Cache-Control")).toBe("private, no-store");
    expect(mockGetPeriodChampions.mock.calls[0]![3]).toBe("member");
  });

  it("rejects invalid types and period keys", async () => {
    expect(
      (
        await call(championsHandler, { method: "GET", query: { type: "X" } })
      )._getStatusCode(),
    ).toBe(400);
    expect(
      (
        await call(championsHandler, {
          method: "GET",
          query: { type: "DAILY", periodKey: "2026-02-31" },
        })
      )._getStatusCode(),
    ).toBe(400);
    expect(mockGetPeriodChampions).not.toHaveBeenCalled();
  });
});
