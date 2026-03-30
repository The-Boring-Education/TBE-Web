import { InputFieldContainer } from "@tbe/components";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("InputFieldContainer", () => {
  it("renders label and forwards input value changes", () => {
    const onChange = vi.fn();
    render(
      <InputFieldContainer
        label="Email"
        type="email"
        value="a@b.com"
        onChange={onChange}
      />,
    );

    expect(screen.getByText("Email")).toBeInTheDocument();
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("a@b.com");

    fireEvent.change(input, { target: { value: "x@y.com" } });
    expect(onChange).toHaveBeenCalledWith("x@y.com");
  });

  it("shows required asterisk when not optional", () => {
    render(
      <InputFieldContainer label="Name" type="text" onChange={() => {}} />,
    );

    const label = screen.getByText("Name").closest("label");
    expect(label?.textContent).toContain("*");
  });

  it("hides required asterisk when optional", () => {
    render(
      <InputFieldContainer
        label="Nickname"
        type="text"
        isOptional
        onChange={() => {}}
      />,
    );

    const label = screen.getByText("Nickname").closest("label");
    expect(label?.textContent).not.toContain("*");
  });
});
