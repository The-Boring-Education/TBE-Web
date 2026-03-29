import { RadioButton } from "@tbe/components";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("RadioButton", () => {
  it("renders label and associates input with label", () => {
    const onClick = vi.fn();
    render(
      <RadioButton
        label="Option A"
        value="a"
        isSelected={false}
        onClick={onClick}
      />,
    );

    expect(screen.getByText("Option A")).toBeInTheDocument();
    const input = screen.getByRole("radio", { name: "Option A" });
    expect(input).not.toBeChecked();
    expect(input).toHaveAttribute("value", "a");
  });

  it("calls onClick when selecting an unselected option", () => {
    const onClick = vi.fn();
    render(
      <RadioButton label="B" value="b" isSelected={false} onClick={onClick} />,
    );

    fireEvent.click(screen.getByRole("radio"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when already selected", () => {
    const onClick = vi.fn();
    render(<RadioButton label="C" value="c" isSelected onClick={onClick} />);

    fireEvent.click(screen.getByRole("radio"));
    expect(onClick).not.toHaveBeenCalled();
  });
});
