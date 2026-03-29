import { RadioInputField } from "@tbe/components";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("RadioInputField", () => {
  it("renders label and invokes onChange with value when label is activated", () => {
    const onChange = vi.fn();
    render(
      <RadioInputField
        label="Monthly"
        value="m"
        selected={false}
        onChange={onChange}
      />,
    );

    expect(screen.getByText("Monthly")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Monthly"));
    expect(onChange).toHaveBeenCalledWith("m");
  });

  it("shows selection image when selected", () => {
    render(
      <RadioInputField label="Yearly" value="y" selected onChange={vi.fn()} />,
    );

    const img = screen.getByRole("img", { name: "developer activities" });
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain("select-radio.svg");
  });

  it("hides selection image when not selected", () => {
    render(
      <RadioInputField
        label="Yearly"
        value="y"
        selected={false}
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("img", { name: "developer activities" }),
    ).not.toBeInTheDocument();
  });
});
