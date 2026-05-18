import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPopulateResolved = vi.fn();

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
    findOne: vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnValue({
        populate: vi.fn(() => mockPopulateResolved()),
      }),
    }),
  },
}));

import { getLeaderboardWithUsersFromDB } from "../../../../api/src/lib/database/queries/leaderboard";

describe("getLeaderboardWithUsersFromDB", () => {
  beforeEach(() => {
    mockPopulateResolved.mockReset();
    mockPopulateResolved.mockResolvedValue(null);
  });

  it("returns stable empty leaderboard when no Mongo document exists yet", async () => {
    const result = await getLeaderboardWithUsersFromDB("DAILY");

    expect(result.error).toBeUndefined();
    expect(result.data).toEqual({
      type: "DAILY",
      app: null,
      entries: [],
    });
  });
});
