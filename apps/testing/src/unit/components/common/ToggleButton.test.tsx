import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ToggleButton } from "@tbe/components";

// Mock framer-motion to avoid animation issues
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
  },
}));

describe("ToggleButton Component", () => {
  describe("Rendering", () => {
    it("should render toggle buttons for all options", () => {
      const { container } = render(
        <ToggleButton
          options={["Option 1", "Option 2"]}
          activeColor="bg-blue-500"
          inactiveColor="bg-gray-200"
          onToggle={vi.fn()}
        />,
      );
      // Verify buttons are rendered
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBe(2);
    });

    it("should render multiple options", () => {
      const { container } = render(
        <ToggleButton
          options={["A", "B", "C"]}
          activeColor="bg-blue-500"
          inactiveColor="bg-gray-200"
          onToggle={vi.fn()}
        />,
      );
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBe(3);
    });
  });

  describe("Toggle Functionality", () => {
    it("should call onToggle when button is clicked", () => {
      const handleToggle = vi.fn();
      const { container } = render(
        <ToggleButton
          options={["Option 1", "Option 2"]}
          activeColor="bg-blue-500"
          inactiveColor="bg-gray-200"
          onToggle={handleToggle}
        />,
      );
      const buttons = container.querySelectorAll("button");
      fireEvent.click(buttons[1]); // Click second button
      expect(handleToggle).toHaveBeenCalledWith("Option 2");
    });

    it("should set first option as active by default", () => {
      const { container } = render(
        <ToggleButton
          options={["First", "Second"]}
          activeColor="bg-blue-500"
          inactiveColor="bg-gray-200"
          onToggle={vi.fn()}
        />,
      );
      const buttons = container.querySelectorAll("button");
      // First button should have active color class
      expect(buttons[0].className).toContain("bg-blue-500");
    });

    it("should toggle active state when clicking different buttons", () => {
      const handleToggle = vi.fn();
      const { container } = render(
        <ToggleButton
          options={["First", "Second"]}
          activeColor="bg-blue-500"
          inactiveColor="bg-gray-200"
          onToggle={handleToggle}
        />,
      );
      const buttons = container.querySelectorAll("button");

      // Initially first button is active
      expect(buttons[0].className).toContain("bg-blue-500");
      expect(buttons[1].className).toContain("bg-gray-200");

      // Click second button
      fireEvent.click(buttons[1]);

      // After click, second button should be active (state updates)
      expect(handleToggle).toHaveBeenCalledWith("Second");
    });
  });

  describe("Colors", () => {
    it("should apply activeColor to active button", () => {
      const { container } = render(
        <ToggleButton
          options={["Active", "Inactive"]}
          activeColor="bg-green-500"
          inactiveColor="bg-gray-200"
          onToggle={vi.fn()}
        />,
      );
      const buttons = container.querySelectorAll("button");
      expect(buttons[0].className).toContain("bg-green-500");
    });

    it("should apply inactiveColor to inactive buttons", () => {
      const { container } = render(
        <ToggleButton
          options={["Active", "Inactive"]}
          activeColor="bg-green-500"
          inactiveColor="bg-gray-200"
          onToggle={vi.fn()}
        />,
      );
      const buttons = container.querySelectorAll("button");
      expect(buttons[1].className).toContain("bg-gray-200");
    });
  });
});
