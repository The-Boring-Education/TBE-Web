import { LoginWithGoogleButton } from "@tbe/components";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSignIn = vi.fn();
const mockTrackEvent = vi.fn();

const authState = vi.hoisted(() => ({
  isAuthenticated: false,
  isLoading: false,
}));

vi.mock("@tbe/auth", () => ({
  useAuth: () => ({
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    signIn: mockSignIn,
    signOut: vi.fn(),
    refreshSession: vi.fn(),
    user: null,
  }),
}));

vi.mock("@tbe/hooks", () => ({
  useAnalytics: () => ({ trackEvent: mockTrackEvent }),
}));

vi.mock("@tbe/utils", async (importOriginal) => {
  const mod = (await importOriginal()) as Record<string, unknown>;
  return { ...mod, trackEvent: vi.fn() };
});

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({
      children,
      whileHover: _whileHover,
      whileTap: _whileTap,
      ...props
    }: any) => (
      <button type="button" {...props}>
        {children}
      </button>
    ),
  },
}));

describe("LoginWithGoogleButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.isAuthenticated = false;
    authState.isLoading = false;
  });

  it("renders custom text and calls signIn(google) with analytics hooks", () => {
    render(<LoginWithGoogleButton text="Continue with Google" />);

    const btn = screen.getByRole("button", { name: "Continue with Google" });
    expect(btn).toHaveAttribute("data-tbe-analytics-skip-global");
    fireEvent.click(btn);

    expect(mockTrackEvent).toHaveBeenCalledWith({
      action: "USER_LOGIN",
      category: "User",
      label: "User Logged In",
    });
    expect(mockSignIn).toHaveBeenCalledWith("google");
  });

  it("renders nothing while loading", () => {
    authState.isLoading = true;
    const { container } = render(<LoginWithGoogleButton />);
    expect(container.querySelector("button")).toBeNull();
  });

  it("renders nothing when already authenticated", () => {
    authState.isAuthenticated = true;
    const { container } = render(<LoginWithGoogleButton />);
    expect(container.querySelector("button")).toBeNull();
  });
});
