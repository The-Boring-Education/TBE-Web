import { UserPointButton } from "@tbe/components";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { renderWithProviders } from "../../../test-utils/test-helpers";

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
    useGamification: () => ({
      loading: false,
      error: null,
      points: 42,
      currentLevel: 2,
      currentLevelName: "Builder",
      nextLevelName: "Pro",
      pointsLeftToNextLevel: 58,
      percentageProgress: 35,
    }),
  };
});

// Prevent actual network calls from reaching the network in CI
const originalFetch = global.fetch;
beforeAll(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ points: 42 }),
    } as Response),
  );
});
afterAll(() => {
  global.fetch = originalFetch;
});

describe("UserPointButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows points after hydration when authenticated", async () => {
    renderWithProviders(<UserPointButton />);

    const pointsElement = await screen.findByText("42", {}, { timeout: 3000 });
    expect(pointsElement).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /42/i })).toBeInTheDocument();
  });

  it("opens popover with gamification summary on click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserPointButton />);

    const button = await screen.findByRole("button", { name: /42/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/YOU'RE AT/i)).toBeVisible();
      expect(screen.getByText(/Builder/i)).toBeInTheDocument();
    });
  });
});
