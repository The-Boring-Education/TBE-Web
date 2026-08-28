import { UserPointButton } from "@tbe/components";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * UserPointButton reads points via useGamification from @tbe/gamification (React Query).
 * Mock that module so tests stay fast and do not require QueryClientProvider.
 */
vi.mock("@tbe/gamification", () => ({
  useGamification: () => ({
    loading: false,
    error: null,
    points: 42,
    currentLevel: 2,
    currentLevelName: "Builder",
    nextLevelName: "Pro",
    pointsLeftToNextLevel: 58,
    percentageProgress: 35,
    refetch: vi.fn(),
  }),
  useGamificationContext: () => ({
    theme: "light",
    showToast: vi.fn(),
    triggerCelebration: vi.fn(),
  }),
}));

vi.mock("@tbe/hooks", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@tbe/hooks")>();
  return {
    ...mod,
    useUser: () => ({
      user: { id: "test-user", isOnboarded: true } as any,
      isAuth: true,
      loading: false,
      isOnboarded: true,
      updateSession: vi.fn(),
    }),
  };
});

describe("UserPointButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows points after hydration when authenticated", async () => {
    render(<UserPointButton />);

    expect(await screen.findByText("42")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /42/i })).toBeInTheDocument();
  });

  it("opens popover with gamification summary on click", async () => {
    const user = userEvent.setup();
    render(<UserPointButton />);

    await screen.findByText("42");
    await user.click(screen.getByRole("button", { name: /42/i }));

    await waitFor(() => {
      expect(screen.getByText(/YOU'RE AT/i)).toBeVisible();
      expect(screen.getByText(/Builder/i)).toBeInTheDocument();
    });
  });
});
