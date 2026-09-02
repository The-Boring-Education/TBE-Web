import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/middleware/requestLogger", () => ({
  withApiHandler: (
    handler: (req: NextApiRequest, res: NextApiResponse) => unknown,
  ) => handler,
}));

const mockEnsureAdminAccess = vi.fn();
const mockVerifyAuthenticatedUser = vi.fn();
vi.mock("@/middleware/admin", () => ({
  ensureAdminAccess: (...args: unknown[]) => mockEnsureAdminAccess(...args),
  verifyAuthenticatedUser: (...args: unknown[]) =>
    mockVerifyAuthenticatedUser(...args),
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/utils", () => ({
  sendAPIResponse: (obj: Record<string, unknown>) => obj,
}));

const mockCountAllAdminUsersFromDB = vi.fn();
const mockCreateAdminUserFromDB = vi.fn();
const mockInvalidateAdminCache = vi.fn();

vi.mock("@/lib/database", () => ({
  countAllAdminUsersFromDB: (...args: unknown[]) =>
    mockCountAllAdminUsersFromDB(...args),
  createAdminUserFromDB: (...args: unknown[]) =>
    mockCreateAdminUserFromDB(...args),
}));

vi.mock("@/lib/services/admin-cache", () => ({
  invalidateAdminCache: (...args: unknown[]) =>
    mockInvalidateAdminCache(...args),
}));

import bootstrapHandler from "../../../api/src/pages/api/v1/admin/admins/bootstrap";

describe("Admin Bootstrap Integration", () => {
  const originalBootstrapEmails = process.env.ADMIN_BOOTSTRAP_EMAILS;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEnsureAdminAccess.mockResolvedValue(true);
    process.env.ADMIN_BOOTSTRAP_EMAILS = "admin@example.com";
    mockVerifyAuthenticatedUser.mockReturnValue({
      sub: "user-id",
      email: "admin@example.com",
      type: "access",
    });
  });

  it("creates first admin when collection is empty", async () => {
    mockCountAllAdminUsersFromDB.mockResolvedValue({ data: 0 });
    mockCreateAdminUserFromDB.mockResolvedValue({
      data: {
        _id: "507f191e810c19729de860ea",
        email: "admin@example.com",
        isActive: true,
      },
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        email: "admin@example.com",
        name: "Admin",
      },
    });

    await bootstrapHandler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(mockCreateAdminUserFromDB).toHaveBeenCalled();
    expect(mockInvalidateAdminCache).toHaveBeenCalled();
  });

  it("returns 409 when admins already exist", async () => {
    mockCountAllAdminUsersFromDB.mockResolvedValue({ data: 1 });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { email: "another@example.com" },
    });

    await bootstrapHandler(req, res);

    expect(mockEnsureAdminAccess).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(409);
    expect(mockCreateAdminUserFromDB).not.toHaveBeenCalled();
  });

  it("rejects bootstrap without authentication", async () => {
    mockVerifyAuthenticatedUser.mockReturnValue(null);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { email: "admin@example.com" },
    });

    await bootstrapHandler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(mockCreateAdminUserFromDB).not.toHaveBeenCalled();
  });

  it("rejects bootstrap when user is not allowlisted", async () => {
    process.env.ADMIN_BOOTSTRAP_EMAILS = "other@example.com";
    mockCountAllAdminUsersFromDB.mockResolvedValue({ data: 0 });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { email: "admin@example.com" },
    });

    await bootstrapHandler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(mockCreateAdminUserFromDB).not.toHaveBeenCalled();
  });

  it("rejects bootstrap for an email other than the authenticated user's", async () => {
    // Allowlisted + authenticated as admin@example.com, but trying to bootstrap
    // a different address — the identity check must block it (403).
    mockCountAllAdminUsersFromDB.mockResolvedValue({ data: 0 });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { email: "someone-else@example.com" },
    });

    await bootstrapHandler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(mockCreateAdminUserFromDB).not.toHaveBeenCalled();
  });

  it("invalidates the admin cache after creating the first admin so it resolves immediately", async () => {
    mockCountAllAdminUsersFromDB.mockResolvedValue({ data: 0 });
    mockCreateAdminUserFromDB.mockResolvedValue({
      data: {
        _id: "507f191e810c19729de860eb",
        email: "admin@example.com",
        isActive: true,
      },
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { email: "admin@example.com" },
    });

    await bootstrapHandler(req, res);

    expect(res._getStatusCode()).toBe(201);
    // The cache must be invalidated so the next isAdminEmail() lookup reloads
    // from the DB and recognizes the newly-created admin (same path a
    // script-created admin relies on).
    expect(mockInvalidateAdminCache).toHaveBeenCalled();
  });

  afterAll(() => {
    process.env.ADMIN_BOOTSTRAP_EMAILS = originalBootstrapEmails;
  });
});
