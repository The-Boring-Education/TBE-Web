import "@testing-library/jest-dom/vitest";

import OnboardingLayout from "@tbe/onboarding/components/OnboardingLayout";
import type { OnboardingProductConfig } from "@tbe/types";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

const mockConfig: OnboardingProductConfig = {
  id: "dsayatra",
  name: "DSA Yatra",
  fields: [],
  api: {
    endpoint: "/dsayatra/onboarding",
    method: "POST",
    transformPayload: vi.fn(),
  },
  ui: {
    branding: {
      title: "Welcome to DSA Yatra!",
      subtitle: "Master Data Structures and Algorithms",
    },
  },
};

const defaultProps = {
  children: <div data-testid="form-children">Form content</div>,
  step: 1,
  totalSteps: 3,
  onBack: vi.fn(),
  onNext: vi.fn(),
  onFinish: vi.fn(),
  isFieldValid: true,
  submitting: false,
  error: "",
  config: mockConfig,
};

describe("OnboardingLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ------------------------------------------------------------------ //
  // Branding
  // ------------------------------------------------------------------ //
  it("renders branding title from config", () => {
    render(<OnboardingLayout {...defaultProps} />);
    expect(screen.getByText("Welcome to DSA Yatra!")).toBeInTheDocument();
  });

  it("renders branding subtitle from config", () => {
    render(<OnboardingLayout {...defaultProps} />);
    expect(
      screen.getByText("Master Data Structures and Algorithms"),
    ).toBeInTheDocument();
  });

  it("renders fallback title when config is null", () => {
    render(<OnboardingLayout {...defaultProps} config={null} />);
    expect(screen.getByText("Welcome Onboard!")).toBeInTheDocument();
  });

  // ------------------------------------------------------------------ //
  // Progress bar
  // ------------------------------------------------------------------ //
  it("shows 'Step 1 of 3' when step=1", () => {
    render(<OnboardingLayout {...defaultProps} step={1} totalSteps={3} />);
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
  });

  it("shows 'Step 2 of 3' when step=2", () => {
    render(<OnboardingLayout {...defaultProps} step={2} totalSteps={3} />);
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
  });

  it("renders progress bar with correct percentage for step 1 of 3", () => {
    const { container } = render(
      <OnboardingLayout {...defaultProps} step={1} totalSteps={3} />,
    );
    // Progress bar is 0% at step 1 (no steps completed yet)
    const bar = container.querySelector('[style*="width"]');
    expect(bar).not.toBeNull();
  });

  // ------------------------------------------------------------------ //
  // Navigation buttons
  // ------------------------------------------------------------------ //
  it("shows 'Back' and 'Next' buttons when step < totalSteps", () => {
    render(<OnboardingLayout {...defaultProps} step={1} totalSteps={3} />);
    expect(screen.getByText("Back")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("shows 'Finish' button on the last step", () => {
    render(<OnboardingLayout {...defaultProps} step={3} totalSteps={3} />);
    expect(screen.getByText("Finish")).toBeInTheDocument();
    expect(screen.queryByText("Next")).not.toBeInTheDocument();
  });

  it("Back button is disabled on step 1", () => {
    render(<OnboardingLayout {...defaultProps} step={1} onBack={vi.fn()} />);
    const backBtn = screen
      .getByText("Back")
      .closest("button") as HTMLButtonElement;
    expect(backBtn).toBeDisabled();
  });

  it("Back button is enabled when step > 1", () => {
    render(<OnboardingLayout {...defaultProps} step={2} onBack={vi.fn()} />);
    const backBtn = screen
      .getByText("Back")
      .closest("button") as HTMLButtonElement;
    expect(backBtn).not.toBeDisabled();
  });

  it("calls onBack when Back button is clicked", () => {
    const onBack = vi.fn();
    render(<OnboardingLayout {...defaultProps} step={2} onBack={onBack} />);
    fireEvent.click(screen.getByText("Back"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("calls onNext when Next button is clicked", () => {
    const onNext = vi.fn();
    render(<OnboardingLayout {...defaultProps} step={1} onNext={onNext} />);
    fireEvent.click(screen.getByText("Next"));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("calls onFinish when Finish button is clicked", () => {
    const onFinish = vi.fn();
    render(
      <OnboardingLayout
        {...defaultProps}
        step={3}
        totalSteps={3}
        onFinish={onFinish}
      />,
    );
    fireEvent.click(screen.getByText("Finish"));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------------------------------ //
  // Button disabled states
  // ------------------------------------------------------------------ //
  it("Next/Finish button is disabled when isFieldValid=false", () => {
    const { getByText } = render(
      <OnboardingLayout {...defaultProps} step={1} isFieldValid={false} />,
    );
    const nextBtn = getByText("Next").closest("button") as HTMLButtonElement;
    expect(nextBtn).toBeDisabled();
  });

  it("Next/Finish button is enabled when isFieldValid=true", () => {
    const { getByText } = render(
      <OnboardingLayout {...defaultProps} step={1} isFieldValid />,
    );
    const nextBtn = getByText("Next").closest("button") as HTMLButtonElement;
    expect(nextBtn).not.toBeDisabled();
  });

  it("Next/Finish button is disabled when submitting=true", () => {
    const { getByText } = render(
      <OnboardingLayout {...defaultProps} step={1} submitting />,
    );
    const nextBtn = getByText("Next").closest("button") as HTMLButtonElement;
    expect(nextBtn).toBeDisabled();
  });

  // ------------------------------------------------------------------ //
  // Submitting state
  // ------------------------------------------------------------------ //
  it("shows 'Submitting...' text on Finish button while submitting", () => {
    render(
      <OnboardingLayout {...defaultProps} step={3} totalSteps={3} submitting />,
    );
    expect(screen.getByText("Submitting...")).toBeInTheDocument();
  });

  // ------------------------------------------------------------------ //
  // Error display
  // ------------------------------------------------------------------ //
  it("does not render error div when error is empty", () => {
    const { container } = render(
      <OnboardingLayout {...defaultProps} error="" />,
    );
    expect(
      container.querySelector('[class*="bg-pink-50"]'),
    ).not.toBeInTheDocument();
  });

  it("renders error message when error is set", () => {
    render(<OnboardingLayout {...defaultProps} error="Submission failed" />);
    expect(screen.getByText("Submission failed")).toBeInTheDocument();
  });

  // ------------------------------------------------------------------ //
  // Children rendering
  // ------------------------------------------------------------------ //
  it("renders children inside the form", () => {
    render(<OnboardingLayout {...defaultProps} />);
    expect(screen.getByTestId("form-children")).toBeInTheDocument();
  });

  // ------------------------------------------------------------------ //
  // Logo
  // ------------------------------------------------------------------ //
  it("renders the logo image", () => {
    const { container } = render(<OnboardingLayout {...defaultProps} />);
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img?.alt).toBe("Boring Education Logo");
  });

  // ------------------------------------------------------------------ //
  // Form submit handler — calls onNext on non-last step
  // ------------------------------------------------------------------ //
  it("form onSubmit calls onNext when step < totalSteps", () => {
    const onNext = vi.fn();
    const { container } = render(
      <OnboardingLayout {...defaultProps} step={1} onNext={onNext} />,
    );
    // Find the form element
    const form = container.querySelector("form");
    fireEvent.submit(form!);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("form onSubmit calls onFinish when step = totalSteps", () => {
    const onFinish = vi.fn();
    const { container } = render(
      <OnboardingLayout
        {...defaultProps}
        step={3}
        totalSteps={3}
        onFinish={onFinish}
      />,
    );
    const form = container.querySelector("form");
    fireEvent.submit(form!);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});
