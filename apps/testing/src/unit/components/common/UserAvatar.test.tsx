import { UserAvatar } from "@tbe/components";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockSignOut = vi.fn();
const mockUseAuth = vi.fn();

vi.mock("@tbe/auth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Instant show/hide so leave animations don't hang under fake timers in jsdom.
vi.mock("@headlessui/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@headlessui/react")>();
  return {
    ...actual,
    Transition: ({ children, show }: any) => (show ? <>{children}</> : null),
  };
});

const mockAuthenticatedUser = () => {
  mockUseAuth.mockReturnValue({
    user: { id: "u1", name: "Sachin" },
    isAuthenticated: true,
    isLoading: false,
    signOut: mockSignOut,
    signIn: vi.fn(),
    refreshSession: vi.fn(),
  });
};

describe("UserAvatar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not render when auth is loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      signOut: mockSignOut,
      signIn: vi.fn(),
      refreshSession: vi.fn(),
    });

    const { container } = render(<UserAvatar />);
    expect(container.firstChild).toBeNull();
  });

  it("does not render when unauthenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      signOut: mockSignOut,
      signIn: vi.fn(),
      refreshSession: vi.fn(),
    });

    const { container } = render(<UserAvatar />);
    expect(container.firstChild).toBeNull();
  });

  it("renders avatar fallback initial when authenticated without image", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u1", name: "Sachin" },
      isAuthenticated: true,
      isLoading: false,
      signOut: mockSignOut,
      signIn: vi.fn(),
      refreshSession: vi.fn(),
    });

    render(<UserAvatar />);

    expect(
      await screen.findByRole("button", { name: /user profile menu/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("S")).toBeInTheDocument();
  });

  it("opens menu and shows user navigation links", async () => {
    const user = userEvent.setup();
    mockAuthenticatedUser();

    render(<UserAvatar />);

    await user.click(
      await screen.findByRole("button", { name: /user profile menu/i }),
    );

    expect(await screen.findByRole("link", { name: /Learn/i })).toBeVisible();
    expect(screen.getByRole("link", { name: /Profile/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /Logout/i })).toBeVisible();
  });

  it("opens on hover and stays open while moving into the menu", async () => {
    mockAuthenticatedUser();

    const { container } = render(<UserAvatar />);
    const trigger = await screen.findByRole("button", {
      name: /user profile menu/i,
    });
    const hoverRoot = trigger.parentElement;
    expect(hoverRoot).not.toBeNull();

    vi.useFakeTimers();

    fireEvent.mouseEnter(hoverRoot!);
    expect(screen.getByRole("link", { name: /Profile/i })).toBeVisible();

    // Crossing the trigger→panel gap briefly leaves the boundary; the close
    // delay must keep the menu open until the cursor reaches an item.
    fireEvent.mouseLeave(hoverRoot!);
    fireEvent.mouseEnter(hoverRoot!);
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByRole("link", { name: /Profile/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /Logout/i })).toBeVisible();
    expect(screen.getByRole("link", { name: /Learn/i })).toBeVisible();
    expect(container.querySelector('[aria-expanded="true"]')).not.toBeNull();
  });

  it("closes after the hover delay when the cursor leaves the menu", async () => {
    mockAuthenticatedUser();

    render(<UserAvatar />);
    const trigger = await screen.findByRole("button", {
      name: /user profile menu/i,
    });
    const hoverRoot = trigger.parentElement!;

    vi.useFakeTimers();

    fireEvent.mouseEnter(hoverRoot);
    expect(screen.getByRole("link", { name: /Profile/i })).toBeVisible();

    fireEvent.mouseLeave(hoverRoot);
    expect(screen.getByRole("link", { name: /Profile/i })).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(screen.getByRole("link", { name: /Profile/i })).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(
      screen.queryByRole("link", { name: /Profile/i }),
    ).not.toBeInTheDocument();
  });

  it("uses dashboardRoute override for dashboard link", async () => {
    const user = userEvent.setup();
    mockAuthenticatedUser();

    render(<UserAvatar variant="prepyatra" dashboardRoute="/dashboard" />);

    await user.click(
      await screen.findByRole("button", { name: /user profile menu/i }),
    );

    const dashboardLink = await screen.findByRole("link", {
      name: /Dashboard/i,
    });
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");
  });

  it("calls signOut with /login on logout click", async () => {
    const user = userEvent.setup();
    mockAuthenticatedUser();

    render(<UserAvatar />);

    await user.click(
      await screen.findByRole("button", { name: /user profile menu/i }),
    );
    await user.click(await screen.findByRole("button", { name: /Logout/i }));

    expect(mockSignOut).toHaveBeenCalledWith("/login");
  });
});
