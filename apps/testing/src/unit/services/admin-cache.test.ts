import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetActiveAdminEmailsFromDB = vi.fn();

vi.mock("@/lib/database", () => ({
  getActiveAdminEmailsFromDB: (...args: unknown[]) =>
    mockGetActiveAdminEmailsFromDB(...args),
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import {
  __resetAdminCacheForTests,
  __setAdminCacheForTests,
  invalidateAdminCache,
  isAdminEmail,
  isAdminEmailCached,
} from "../../../../api/src/lib/services/admin-cache";

describe("Admin Cache Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetAdminCacheForTests();
  });

  it("isAdminEmailCached returns false for empty cache", () => {
    expect(isAdminEmailCached("admin@example.com")).toBe(false);
  });

  it("isAdminEmailCached matches normalized emails", () => {
    __setAdminCacheForTests(["Admin@Example.com"]);
    expect(isAdminEmailCached("admin@example.com")).toBe(true);
  });

  it("isAdminEmail loads emails from DB when cache is stale", async () => {
    mockGetActiveAdminEmailsFromDB.mockResolvedValue({
      data: ["admin@example.com"],
    });

    await expect(isAdminEmail("admin@example.com")).resolves.toBe(true);
    expect(mockGetActiveAdminEmailsFromDB).toHaveBeenCalledTimes(1);
    expect(isAdminEmailCached("admin@example.com")).toBe(true);
  });

  it("invalidateAdminCache clears cached emails", async () => {
    __setAdminCacheForTests(["admin@example.com"]);
    invalidateAdminCache();
    expect(isAdminEmailCached("admin@example.com")).toBe(false);
  });

  it("resolves a script-created admin after cache invalidation", async () => {
    // Simulate the initial (empty) admin set.
    mockGetActiveAdminEmailsFromDB.mockResolvedValueOnce({ data: [] });
    await expect(isAdminEmail("new-admin@example.com")).resolves.toBe(false);

    // The admin:add script writes directly to the adminusers collection.
    // After invalidation, the next lookup reloads from the DB and the new
    // admin resolves as authorized.
    mockGetActiveAdminEmailsFromDB.mockResolvedValueOnce({
      data: ["new-admin@example.com"],
    });
    invalidateAdminCache();

    await expect(isAdminEmail("new-admin@example.com")).resolves.toBe(true);
    expect(isAdminEmailCached("new-admin@example.com")).toBe(true);
  });
});
