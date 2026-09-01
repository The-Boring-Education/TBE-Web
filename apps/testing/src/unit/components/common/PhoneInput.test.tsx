import { PhoneInput, StepPhoneNumber } from "@tbe/components";
import { fireEvent, render, screen } from "@testing-library/react";
import React, { useState } from "react";

describe("PhoneInput component", () => {
  it("renders with India (+91) flag and dial code selected by default", () => {
    render(<PhoneInput value="" />);
    expect(screen.getByText("+91")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "India" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("98765 43210")).toBeInTheDocument();
  });

  it("automatically detects country when an international prefix is typed", () => {
    const handleChange = vi.fn();
    const TestComponent = () => {
      const [val, setVal] = useState("");
      return (
        <PhoneInput
          value={val}
          onChange={(newVal, meta) => {
            setVal(newVal);
            handleChange(newVal, meta);
          }}
        />
      );
    };

    render(<TestComponent />);
    const input = screen.getByPlaceholderText("98765 43210");

    fireEvent.change(input, { target: { value: "+1 415 555 2671" } });

    expect(screen.getByText("+1")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "United States" }),
    ).toBeInTheDocument();
    expect(handleChange).toHaveBeenCalledWith(
      "+1 415 555 2671",
      expect.objectContaining({
        country: "US",
        dialCode: "+1",
        isValid: true,
      }),
    );
  });

  it("opens country selector dropdown and allows selecting another country", () => {
    const handleChange = vi.fn();
    render(<PhoneInput value="" onChange={handleChange} />);

    // Click country selector button
    const countryButton = screen.getByRole("button", {
      name: "Select Country",
    });
    fireEvent.click(countryButton);

    // Search or click another country (e.g. United Kingdom)
    const ukOption = screen.getByRole("button", {
      name: /United Kingdom/i,
    });
    fireEvent.click(ukOption);

    expect(screen.getByText("+44")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "United Kingdom" }),
    ).toBeInTheDocument();
  });

  it("shows valid checkmark indicator when structurally valid number is typed", () => {
    render(<PhoneInput value="+91 98765 43210" />);
    expect(screen.getByTitle("Valid phone number")).toBeInTheDocument();
  });

  it("does not show valid checkmark when number is incomplete or invalid", () => {
    render(<PhoneInput value="+91 987654" />);
    expect(screen.queryByTitle("Valid phone number")).not.toBeInTheDocument();
  });
});

describe("StepPhoneNumber container", () => {
  it("renders within onboarding step and propagates onChange", () => {
    const onChange = vi.fn();
    render(<StepPhoneNumber value="+91 98765 43210" onChange={onChange} />);

    expect(screen.getByText("Your Contact No")).toBeInTheDocument();
    expect(screen.getByText("+91")).toBeInTheDocument();

    const input = screen.getByDisplayValue("98765 43210");
    fireEvent.change(input, { target: { value: "98765 00000" } });

    expect(onChange).toHaveBeenCalled();
  });
});
