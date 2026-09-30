import Button from "@tbe/components/common/Buttons/Button";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
  },
}));

describe("Button Component", () => {
  describe("Rendering", () => {
    it("should render a button element", () => {
      const { container } = render(<Button variant="PRIMARY">Click Me</Button>);
      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
    });

    it("should render children content", () => {
      render(<Button variant="PRIMARY">Hello World</Button>);
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });
  });

  describe("Click Handling", () => {
    it("should call onClick when clicked", () => {
      const handleClick = vi.fn();
      render(
        <Button variant="PRIMARY" onClick={handleClick}>
          Click Me
        </Button>,
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe("Disabled State", () => {
    it("should be interactive by default", () => {
      const handleClick = vi.fn();
      render(
        <Button variant="PRIMARY" onClick={handleClick}>
          Enabled
        </Button>,
      );

      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalled();
    });

    it("should disable the rendered button when disabled is true", () => {
      const handleClick = vi.fn();
      render(
        <Button variant="PRIMARY" disabled onClick={handleClick}>
          Disabled
        </Button>,
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-disabled", "true");

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should let disabled take precedence over active", () => {
      const handleClick = vi.fn();
      render(
        <Button variant="PRIMARY" active disabled onClick={handleClick}>
          Active but disabled
        </Button>,
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should stay enabled when disabled is explicitly false", () => {
      const handleClick = vi.fn();
      render(
        <Button variant="PRIMARY" disabled={false} onClick={handleClick}>
          Not disabled
        </Button>,
      );

      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalled();
    });

    it("should disable the button when active is false", () => {
      const handleClick = vi.fn();
      render(
        <Button variant="PRIMARY" active={false} onClick={handleClick}>
          Inactive
        </Button>,
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should disable the button while loading", () => {
      const handleClick = vi.fn();
      render(
        <Button variant="PRIMARY" isLoading onClick={handleClick}>
          Loading
        </Button>,
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should remain disabled when disabled and isLoading are combined", () => {
      const handleClick = vi.fn();
      render(
        <Button variant="PRIMARY" disabled isLoading onClick={handleClick}>
          Disabled and loading
        </Button>,
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should apply the inactive styling when disabled", () => {
      const { container } = render(
        <Button variant="PRIMARY" disabled>
          Disabled
        </Button>,
      );

      const button = container.querySelector("button");
      expect(button?.className).toContain("cursor-not-allowed");
      expect(button?.className).not.toContain("bg-primary");
    });
  });

  describe("Variants", () => {
    it("should render PRIMARY variant", () => {
      const { container } = render(<Button variant="PRIMARY">Primary</Button>);
      expect(container.querySelector("button")).toBeInTheDocument();
    });

    it("should render SECONDARY variant", () => {
      const { container } = render(
        <Button variant="SECONDARY">Secondary</Button>,
      );
      expect(container.querySelector("button")).toBeInTheDocument();
    });

    it("should render OUTLINE variant", () => {
      const { container } = render(<Button variant="OUTLINE">Outline</Button>);
      expect(container.querySelector("button")).toBeInTheDocument();
    });
  });

  describe("Size Variants", () => {
    it("should render SMALL size", () => {
      const { container } = render(
        <Button variant="PRIMARY" size="SMALL">
          Small
        </Button>,
      );
      expect(container.querySelector("button")).toBeInTheDocument();
    });

    it("should render LARGE size", () => {
      const { container } = render(
        <Button variant="PRIMARY" size="LARGE">
          Large
        </Button>,
      );
      expect(container.querySelector("button")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have button role", () => {
      render(<Button variant="PRIMARY">Accessible</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });
});
