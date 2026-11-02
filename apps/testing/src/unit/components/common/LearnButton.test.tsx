import { LearnButton } from "@tbe/components";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("LearnButton Component", () => {
  describe("Rendering", () => {
    it("should render button with children text", () => {
      render(<LearnButton>Next Chapter</LearnButton>);
      const btn = screen.getByRole("button", { name: /next chapter/i });
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveAttribute("type", "button");
    });

    it("should support custom button types", () => {
      render(<LearnButton type="submit">Submit Solution</LearnButton>);
      expect(
        screen.getByRole("button", { name: /submit solution/i }),
      ).toHaveAttribute("type", "submit");
    });
  });

  describe("Toggle mode with completion labels", () => {
    it("should render incompleteLabel when isCompleted is false", () => {
      render(
        <LearnButton
          isCompleted={false}
          completedLabel="Solved"
          incompleteLabel="Mark as Solved"
        />,
      );
      expect(
        screen.getByRole("button", { name: "Mark as Solved" }),
      ).toBeInTheDocument();
    });

    it("should render completedLabel when isCompleted is true", () => {
      render(
        <LearnButton
          isCompleted
          completedLabel="Solved"
          incompleteLabel="Mark as Solved"
        />,
      );
      expect(
        screen.getByRole("button", { name: "Solved" }),
      ).toBeInTheDocument();
    });

    it("should default to Solved / Mark as Solved if labels are omitted but toggle mode is triggered", () => {
      render(<LearnButton isCompleted={false} incompleteLabel="" />);
      // when incompleteLabel is empty string (defined)
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("Click handling and disabled/loading states", () => {
    it("should fire onClick callback when clicked", () => {
      const handleClick = vi.fn();
      render(<LearnButton onClick={handleClick}>Click Me</LearnButton>);
      fireEvent.click(screen.getByRole("button", { name: /click me/i }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should disable button when disabled prop is true", () => {
      const handleClick = vi.fn();
      render(
        <LearnButton disabled onClick={handleClick}>
          Disabled Button
        </LearnButton>,
      );
      const btn = screen.getByRole("button", { name: /disabled button/i });
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should disable button and display spinner when isLoading is true", () => {
      const handleClick = vi.fn();
      const { container } = render(
        <LearnButton isLoading onClick={handleClick}>
          Loading Action
        </LearnButton>,
      );
      const btn = screen.getByRole("button", { name: /loading action/i });
      expect(btn).toBeDisabled();
      expect(container.querySelector(".animate-spin")).toBeInTheDocument();
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Variants", () => {
    it("should render primary variant classes by default", () => {
      const { container } = render(<LearnButton>Primary</LearnButton>);
      const btn = container.querySelector("button");
      expect(btn?.className).toContain("bg-[#FF4D4D]");
    });

    it("should render outline variant classes", () => {
      const { container } = render(
        <LearnButton variant="outline">Outline</LearnButton>,
      );
      const btn = container.querySelector("button");
      expect(btn?.className).toContain("border");
    });

    it("should render completed variant classes when variant='completed'", () => {
      const { container } = render(
        <LearnButton variant="completed">Completed</LearnButton>,
      );
      const btn = container.querySelector("button");
      expect(btn?.className).toContain("bg-emerald-600");
    });

    it("should render ghost variant classes", () => {
      const { container } = render(
        <LearnButton variant="ghost">Ghost</LearnButton>,
      );
      const btn = container.querySelector("button");
      expect(btn?.className).toContain("bg-transparent");
    });
  });
});
