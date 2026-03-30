import { LoginRedirectButton } from "@tbe/components";
import { nextNavigationTest } from "@test-utils/next-navigation-mock";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/auth", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    refreshSession: vi.fn(),
    user: null,
  }),
}));

vi.mock("@tbe/utils", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@tbe/utils")>();
  return { ...mod, trackEvent: vi.fn() };
});

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, whileHover, whileTap, ...props }: any) => (
      <button type="button" {...props}>
        {children}
      </button>
    ),
  },
}));

describe("LoginRedirectButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nextNavigationTest.pathname = "/";
  });

  it("renders after client hydration and navigates to /login with redirect on platform paths", async () => {
    nextNavigationTest.pathname = "/courses";
    render(<LoginRedirectButton />);

    const btn = await screen.findByRole("button");
    expect(btn).toHaveAttribute("text", "Login to Start");
    fireEvent.click(btn);

    expect(nextNavigationTest.push).toHaveBeenCalledWith(
      "/login?redirect=%2Fcourses",
    );
  });

  it("uses /auth and callbackUrl for prep-yatra style paths", async () => {
    nextNavigationTest.pathname = "/dashboard/home";
    render(<LoginRedirectButton />);

    const btn = await screen.findByRole("button");
    expect(btn).toHaveAttribute("text", "Login to Start");
    fireEvent.click(btn);

    expect(nextNavigationTest.push).toHaveBeenCalledWith(
      "/auth?callbackUrl=%2Fdashboard%2Fhome",
    );
  });

  it("renders nothing on /login or /auth", async () => {
    nextNavigationTest.pathname = "/login";
    const { container, rerender } = render(<LoginRedirectButton />);
    await waitFor(() => {
      expect(container.querySelector("button")).toBeNull();
    });

    nextNavigationTest.pathname = "/auth";
    rerender(<LoginRedirectButton />);
    await waitFor(() => {
      expect(container.querySelector("button")).toBeNull();
    });
  });
});
