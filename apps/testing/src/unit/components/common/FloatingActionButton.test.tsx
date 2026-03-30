import { FloatingActionButton } from "@tbe/components";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("FloatingActionButton", () => {
  it("renders icon content and accessible name", () => {
    render(
      <FloatingActionButton
        icon={<span data-testid="fab-icon">+</span>}
        onClick={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Floating Action Button" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("fab-icon")).toHaveTextContent("+");
  });

  it("calls onClick when pressed", () => {
    const onClick = vi.fn();
    render(<FloatingActionButton icon={<span>up</span>} onClick={onClick} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Floating Action Button" }),
    );
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("merges custom className onto the button", () => {
    const { container } = render(
      <FloatingActionButton
        className="extra-class"
        icon={<span>x</span>}
        onClick={vi.fn()}
      />,
    );

    const btn = container.querySelector("button");
    expect(btn?.className).toContain("extra-class");
    expect(btn?.className).toContain("bg-primary");
  });
});
