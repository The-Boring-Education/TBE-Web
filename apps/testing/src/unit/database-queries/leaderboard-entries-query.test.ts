import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFind = vi.fn();
const mockSort = vi.fn();

vi.mock("../../../../api/src/lib/utils/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock("../../../../api/src/lib/database/models", () => ({
  Gamification: {},
  Leaderboard: {
    find: (...args: unknown[]) => mockFind(...args),
  },
}));

import { getLeaderboardEntriesFromDB } from "../../../../api/src/lib/database/queries/leaderboard";

describe("getLeaderboardEntriesFromDB", () => {
  beforeEach(() => {
    mockFind.mockReturnValue({ sort: mockSort });
    mockSort.mockResolvedValue([]);
  });

  it("filters by type and app using allow-listed values only", async () => {
    await getLeaderboardEntriesFromDB("WEEKLY", "QUIZ");

    expect(mockFind).toHaveBeenCalledWith({ type: "WEEKLY", app: "QUIZ" });
  });

  it("omits invalid app from the query", async () => {
    await getLeaderboardEntriesFromDB("DAILY", "NOT_AN_APP" as never);

    expect(mockFind).toHaveBeenCalledWith({ type: "DAILY" });
  });
});
