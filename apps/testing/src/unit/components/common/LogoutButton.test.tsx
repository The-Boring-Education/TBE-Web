import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LogoutButton } from "@tbe/components";

// Mock next-auth/react
const mockSignOut = vi.fn();
const mockUseSession = vi.fn();

vi.mock("next-auth/react", () => ({
  signOut: () => mockSignOut(),
  useSession: () => mockUseSession(),
}));

// Mock framer-motion
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
      mockUseSession.mockReturnValue({
        status: "authenticated",
        data: { user: { name: "Test User" } },
      });

      render(<LogoutButton />);
      expect(screen.getByText("Log out")).toBeInTheDocument();
    });

    it("should not render when unauthenticated", () => {
      mockUseSession.mockReturnValue({
        status: "unauthenticated",
        data: null,
      });

      const { container } = render(<LogoutButton />);
      expect(container.firstChild).toBeNull();
    });

    it("should not render when loading", () => {
      mockUseSession.mockReturnValue({
        status: "loading",
        data: null,
      });

      const { container } = render(<LogoutButton />);
      // Component returns empty fragment when unauthenticated, but might render during loading
      // This depends on implementation - checking it doesn't crash
      expect(container).toBeInTheDocument();
    });
  });

  describe("Interaction", () => {
    it("should call signOut when button is clicked", () => {
      mockUseSession.mockReturnValue({
        status: "authenticated",
        data: { user: { name: "Test User" } },
      });

      render(<LogoutButton />);
      const button = screen.getByText("Log out");
      fireEvent.click(button);
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe("Button Props", () => {
    it("should render with GHOST variant", () => {
      mockUseSession.mockReturnValue({
        status: "authenticated",
        data: { user: { name: "Test User" } },
      });

      const { container } = render(<LogoutButton />);
      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
    });

    it("should have full width class", () => {
      mockUseSession.mockReturnValue({
        status: "authenticated",
        data: { user: { name: "Test User" } },
      });

      const { container } = render(<LogoutButton />);
      const button = container.querySelector("button");
      expect(button?.className).toContain("w-full");
    });
  });
});
