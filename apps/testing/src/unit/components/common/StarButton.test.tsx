import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StarButton } from "@tbe/components";

// Mock @headlessui/react
vi.mock("@headlessui/react", () => ({
  Button: ({ children, onClick, disabled, className, type }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      type={type}
    >
      {children}
    </button>
  ),
}));

// Mock react-icons
vi.mock("react-icons/fa", () => ({
  FaStar: ({ className }: any) => (
    <svg className={className} data-testid="star-icon" />
  ),
}));

describe("StarButton Component", () => {
  describe("Rendering", () => {
    it("should render star button", () => {
      render(<StarButton isStarred={false} onToggle={vi.fn()} />);
      expect(screen.getByTestId("star-icon")).toBeInTheDocument();
    });

    it("should render as button element", () => {
      render(<StarButton isStarred={false} onToggle={vi.fn()} />);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Starred State", () => {
    it("should render starred state when isStarred is true", () => {
      const { container } = render(
        <StarButton isStarred={true} onToggle={vi.fn()} />,
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("bg-yellow-100");
    });

    it("should render unstarred state when isStarred is false", () => {
      const { container } = render(
        <StarButton isStarred={false} onToggle={vi.fn()} />,
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("bg-white");
    });
  });

  describe("Interaction", () => {
    it("should call onToggle when clicked", () => {
      const handleToggle = vi.fn();
      render(<StarButton isStarred={false} onToggle={handleToggle} />);
      const button = screen.getByRole("button");
      fireEvent.click(button);
      expect(handleToggle).toHaveBeenCalled();
    });

    it("should be disabled when isLoading is true", () => {
      render(
        <StarButton isStarred={false} onToggle={vi.fn()} isLoading={true} />,
      );
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should not be disabled when isLoading is false", () => {
      render(
        <StarButton isStarred={false} onToggle={vi.fn()} isLoading={false} />,
      );
      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });
  });

  describe("Props", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <StarButton
          isStarred={false}
          onToggle={vi.fn()}
          className="custom-class"
        />,
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("custom-class");
    });
  });
});
