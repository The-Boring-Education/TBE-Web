import { LogoutButton } from "@tbe/components";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSignOut = vi.fn();
const mockUseAuth = vi.fn();

vi.mock("@tbe/auth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
  },
}));

describe("LogoutButton Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render logout button when authenticated", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        signOut: mockSignOut,
        user: { name: "Test User" },
        isLoading: false,
        signIn: vi.fn(),
        refreshSession: vi.fn(),
      });

      render(<LogoutButton />);
      expect(screen.getByText("Log out")).toBeInTheDocument();
    });

    it("should not render when unauthenticated", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        signOut: mockSignOut,
        user: null,
        isLoading: false,
        signIn: vi.fn(),
        refreshSession: vi.fn(),
      });

      render(<LogoutButton />);
      expect(screen.queryByText("Log out")).not.toBeInTheDocument();
    });

    it("should not render when loading", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        signOut: mockSignOut,
        user: null,
        isLoading: true,
        signIn: vi.fn(),
        refreshSession: vi.fn(),
      });

      const { container } = render(<LogoutButton />);
      expect(container).toBeInTheDocument();
    });
  });

  describe("Interaction", () => {
    it("should call signOut when button is clicked", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        signOut: mockSignOut,
        user: { name: "Test User" },
        isLoading: false,
        signIn: vi.fn(),
        refreshSession: vi.fn(),
      });

      render(<LogoutButton />);
      const button = screen.getByText("Log out");
      fireEvent.click(button);
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe("Button Props", () => {
    it("should render with GHOST variant", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        signOut: mockSignOut,
        user: { name: "Test User" },
        isLoading: false,
        signIn: vi.fn(),
        refreshSession: vi.fn(),
      });

      const { container } = render(<LogoutButton />);
      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
    });

    it("should have full width class", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        signOut: mockSignOut,
        user: { name: "Test User" },
        isLoading: false,
        signIn: vi.fn(),
        refreshSession: vi.fn(),
      });

      const { container } = render(<LogoutButton />);
      const button = container.querySelector("button");
      expect(button?.className).toContain("w-full");
    });
  });
});
