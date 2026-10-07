import { createWrapper } from "@test-utils/query-wrapper";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/utils", () => ({ sendRequest: vi.fn() }));
vi.mock("@tbe/hooks", () => ({
  useUser: () => ({
    user: { id: "me", name: "Maya Iyer", email: "m@example.com" },
    isAuth: true,
  }),
}));

import LeaderboardCard from "@tbe/gamification/leaderboard/LeaderboardCard";
import { sendRequest } from "@tbe/utils";

const mockSendRequest = vi.mocked(sendRequest);

const topTen = Array.from({ length: 10 }, (_, i) => ({
  rank: i + 1,
  userId: `u${i + 1}`,
  displayName: `Learner ${i + 1}`,
  score: 500 - i * 10,
}));

const respond = (overrides: {
  entries?: typeof topTen;
  viewer?: unknown;
  periodKey?: string;
}) =>
  mockSendRequest.mockImplementation(async ({ url }: { url: string }) => {
    if (url.startsWith("/leaderboard/me")) {
      return { data: { standings: {}, badges: { WEEKLY: 2, MONTHLY: 0 }, preferences: {} } };
    }
    if (url.startsWith("/leaderboard/champions")) return { data: null };
    return {
      data: {
        type: url.includes("DAILY") ? "DAILY" : "WEEKLY",
        periodKey: overrides.periodKey ?? "2026-W39",
        resetsAt: new Date(Date.now() + 2 * 86_400_000 + 4 * 3_600_000 + 60_000).toISOString(),
        totalLearners: overrides.entries?.length ?? 0,
        entries: overrides.entries ?? [],
        viewer: overrides.viewer ?? { rank: null, score: 0, nextTarget: null },
      },
    };
  });

const renderCard = () => {
  const { wrapper: Wrapper } = createWrapper();
  return render(
    <Wrapper>
      <LeaderboardCard fullPageHref="/leaderboard" />
    </Wrapper>,
  );
};

describe("LeaderboardCard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows the top learners, the learner's own row and next target", async () => {
    respond({
      entries: topTen,
      viewer: {
        rank: 42,
        score: 120,
        nextTarget: { displayName: "Rahul", gap: 15, rank: 41 },
      },
    });
    renderCard();

    expect(await screen.findByText("Learner 1")).toBeInTheDocument();
    expect(screen.getByText("Learner 10")).toBeInTheDocument();
    expect(screen.getByText("#42")).toBeInTheDocument();
    expect(screen.getByText("Maya Iyer")).toBeInTheDocument();
    expect(screen.getByText(/15 pts/)).toBeInTheDocument();
    expect(screen.getByText(/to pass/)).toHaveTextContent("Rahul (#41)");
    expect(screen.getByText(/Resets in 2d 4h/)).toBeInTheDocument();
    expect(await screen.findByText(/Weekly Champion ×2/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View full leaderboard/ })).toHaveAttribute(
      "href",
      "/leaderboard",
    );
  });

  it("does not duplicate the learner's row when they are already in the top 10", async () => {
    const entries = topTen.map((e, i) =>
      i === 2 ? { ...e, userId: "me", displayName: "Maya Iyer" } : e,
    );
    respond({ entries, viewer: { rank: 3, score: 480, nextTarget: null } });
    renderCard();

    await screen.findByText("Learner 1");
    expect(screen.getAllByText("Maya Iyer")).toHaveLength(1);
    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("invites the learner in when the board is empty", async () => {
    respond({ entries: [] });
    renderCard();

    expect(await screen.findByText("The board is wide open")).toBeInTheDocument();
    expect(
      screen.getByText(/Complete one lesson or question to get on/),
    ).toBeInTheDocument();
  });

  it("loads the Daily board when its tab is selected", async () => {
    respond({ entries: topTen });
    renderCard();
    await screen.findByText("Learner 1");

    fireEvent.click(screen.getByRole("tab", { name: "Daily" }));

    await waitFor(() =>
      expect(mockSendRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "/leaderboard?type=DAILY&limit=10",
      }),
    );
    expect(screen.getByRole("tab", { name: "Daily" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
