import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@tbe/components";

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
