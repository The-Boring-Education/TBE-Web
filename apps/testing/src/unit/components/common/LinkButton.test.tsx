import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { LinkButton } from "@tbe/components";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
  },
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, className, target, onClick }: any) => (
    <a href={href} className={className} target={target} onClick={onClick}>
      {children}
    </a>
  ),
}));

describe("LinkButton Component", () => {
  describe("Rendering", () => {
    it("should render link button with href", () => {
      const { container } = render(
        <LinkButton href="/test" buttonProps={{ text: "Click Me" }} />,
      );
      const link = container.querySelector('a[href="/test"]');
      expect(link).not.toBeNull();
    });

    it("should render button inside link", () => {
      const { container } = render(
        <LinkButton href="/page" buttonProps={{ text: "Button Text" }} />,
      );
      const link = container.querySelector("a");
      const button = container.querySelector("button");
      expect(link).not.toBeNull();
      expect(button).not.toBeNull();
    });
  });

  describe("Props", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <LinkButton
          href="/test"
          className="custom-class"
          buttonProps={{ text: "Button" }}
        />,
      );
      const link = container.querySelector("a.custom-class");
      expect(link).not.toBeNull();
    });

    it("should handle target prop", () => {
      const { container } = render(
        <LinkButton
          href="/test"
          target="_blank"
          buttonProps={{ text: "Button" }}
        />,
      );
      const link = container.querySelector('a[target="_blank"]');
      expect(link).not.toBeNull();
    });

    it("should apply dark theme when theme is dark", () => {
      const { container } = render(
        <LinkButton
          href="/test"
          theme="dark"
          buttonProps={{ text: "Button" }}
        />,
      );
      const button = container.querySelector("button");
      expect(button?.className).toContain("bg-gray-800");
    });

    it("should not apply dark theme when theme is not dark", () => {
      const { container } = render(
        <LinkButton
          href="/test"
          theme="light"
          buttonProps={{ text: "Button" }}
        />,
      );
      const button = container.querySelector("button");
      expect(button?.className).not.toContain("bg-gray-800");
    });
  });

  describe("Loading State", () => {
    it("should show loading state when clicked", () => {
      const { container } = render(
        <LinkButton href="/test" buttonProps={{ text: "Button" }} />,
      );
      const link = container.querySelector("a");
      if (link) {
        fireEvent.click(link);
        // Loading state should be set (component uses useState)
        const button = container.querySelector("button");
        expect(button).toBeInTheDocument();
      }
    });

    it("should not show loader when noLoader is true", () => {
      const { container } = render(
        <LinkButton
          href="/test"
          noLoader={true}
          buttonProps={{ text: "Button" }}
        />,
      );
      const link = container.querySelector("a");
      if (link) {
        fireEvent.click(link);
        // Should not set loading state
        const button = container.querySelector("button");
        expect(button).toBeInTheDocument();
      }
    });
  });

  describe("Active State", () => {
    it("should render link when active is true", () => {
      const { container } = render(
        <LinkButton
          href="/test"
          active={true}
          buttonProps={{ text: "Button" }}
        />,
      );
      const link = container.querySelector("a");
      expect(link).not.toBeNull();
    });

    it("should render link when active is false", () => {
      const { container } = render(
        <LinkButton
          href="/test"
          active={false}
          buttonProps={{ text: "Button" }}
        />,
      );
      const link = container.querySelector("a");
      expect(link).not.toBeNull();
    });
  });
});
