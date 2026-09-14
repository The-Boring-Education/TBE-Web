import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import StepPhoneNumber from "@tbe/components/containers/Page/Onboarding/StepPhoneNumber";

describe("StepPhoneNumber Component", () => {
  it("renders country code selector and phone input", () => {
    render(
      <StepPhoneNumber
        countryCode="+91"
        phoneNumber="9876543210"
        onChangeCode={vi.fn()}
        onChangeNumber={vi.fn()}
      />,
    );

    expect(screen.getByText("Your Contact No")).toBeInTheDocument();
    const input = screen.getByPlaceholderText("10-digit mobile number");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("9876543210");
  });

  it("filters non-digit characters and calls onChangeNumber", () => {
    const onChangeNumber = vi.fn();
    render(
      <StepPhoneNumber
        countryCode="+91"
        phoneNumber=""
        onChangeCode={vi.fn()}
        onChangeNumber={onChangeNumber}
      />,
    );

    const input = screen.getByPlaceholderText("10-digit mobile number");
    fireEvent.change(input, { target: { value: "987-65a-4321" } });

    expect(onChangeNumber).toHaveBeenCalledWith("987654321");
  });

  it("strips country code prefix when user pastes full number with country code", () => {
    const onChangeNumber = vi.fn();
    render(
      <StepPhoneNumber
        countryCode="+91"
        phoneNumber=""
        onChangeCode={vi.fn()}
        onChangeNumber={onChangeNumber}
      />,
    );

    const input = screen.getByPlaceholderText("10-digit mobile number");
    fireEvent.change(input, { target: { value: "+919876543210" } });

    expect(onChangeNumber).toHaveBeenCalledWith("9876543210");
  });

  it("limits number to 10 digits max", () => {
    const onChangeNumber = vi.fn();
    render(
      <StepPhoneNumber
        countryCode="+91"
        phoneNumber=""
        onChangeCode={vi.fn()}
        onChangeNumber={onChangeNumber}
      />,
    );

    const input = screen.getByPlaceholderText("10-digit mobile number");
    fireEvent.change(input, { target: { value: "987654321012345" } });

    expect(onChangeNumber).toHaveBeenCalledWith("9876543210");
  });
});
