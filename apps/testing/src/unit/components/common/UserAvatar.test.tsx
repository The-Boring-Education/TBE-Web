import { UserAvatar } from "@tbe/components";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSignOut = vi.fn();
const mockUseAuth = vi.fn();

vi.mock("@tbe/auth", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("UserAvatar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    mockUseAuth.mockReturnValue({
      user: { id: "u1", name: "Sachin" },
      isAuthenticated: true,
      isLoading: false,
      signOut: mockSignOut,
      signIn: vi.fn(),
      refreshSession: vi.fn(),
    });

    render(<UserAvatar />);

    await user.click(
      await screen.findByRole("button", { name: /user profile menu/i }),
    );

    expect(
      await screen.findByRole("link", { name: "Dashboard" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Profile" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Logout" })).toBeVisible();
  });

  it("uses dashboardRoute override for dashboard link", async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      user: { id: "u1", name: "Sachin" },
      isAuthenticated: true,
      isLoading: false,
      signOut: mockSignOut,
      signIn: vi.fn(),
      refreshSession: vi.fn(),
    });

    render(<UserAvatar dashboardRoute="/dashboard" />);

    await user.click(
      await screen.findByRole("button", { name: /user profile menu/i }),
    );

    const dashboardLink = await screen.findByRole("link", {
      name: "Dashboard",
    });
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");
  });

  it("calls signOut with /login on logout click", async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      user: { id: "u1", name: "Sachin" },
      isAuthenticated: true,
      isLoading: false,
      signOut: mockSignOut,
      signIn: vi.fn(),
      refreshSession: vi.fn(),
    });

    render(<UserAvatar />);

    await user.click(
      await screen.findByRole("button", { name: /user profile menu/i }),
    );
    await user.click(await screen.findByRole("button", { name: "Logout" }));

    expect(mockSignOut).toHaveBeenCalledWith("/login");
  });
});
