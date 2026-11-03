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
} from "../../../../api/src/lib/services/admin-cache";

describe("Admin Cache Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetAdminCacheForTests();
  });

  it("isAdminEmail returns false for empty input without hitting the DB", async () => {
    await expect(isAdminEmail("")).resolves.toBe(false);
    await expect(isAdminEmail(undefined)).resolves.toBe(false);
    expect(mockGetActiveAdminEmailsFromDB).not.toHaveBeenCalled();
  });

  it("isAdminEmail matches normalized emails from a fresh cache", async () => {
    __setAdminCacheForTests(["Admin@Example.com"]);
    await expect(isAdminEmail(" admin@example.COM ")).resolves.toBe(true);
    expect(mockGetActiveAdminEmailsFromDB).not.toHaveBeenCalled();
  });

  it("isAdminEmail loads emails from DB when cache is stale", async () => {
    mockGetActiveAdminEmailsFromDB.mockResolvedValue({
      data: ["admin@example.com"],
    });

    await expect(isAdminEmail("admin@example.com")).resolves.toBe(true);
    await expect(isAdminEmail("admin@example.com")).resolves.toBe(true);
    expect(mockGetActiveAdminEmailsFromDB).toHaveBeenCalledTimes(1);
  });

  it("isAdminEmail returns false when the DB load fails", async () => {
    mockGetActiveAdminEmailsFromDB.mockResolvedValue({ error: "boom" });
    await expect(isAdminEmail("admin@example.com")).resolves.toBe(false);
  });

  it("invalidateAdminCache forces a reload on next lookup", async () => {
    __setAdminCacheForTests(["admin@example.com"]);
    invalidateAdminCache();
    mockGetActiveAdminEmailsFromDB.mockResolvedValue({ data: [] });

    await expect(isAdminEmail("admin@example.com")).resolves.toBe(false);
    expect(mockGetActiveAdminEmailsFromDB).toHaveBeenCalledTimes(1);
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
  });
});
