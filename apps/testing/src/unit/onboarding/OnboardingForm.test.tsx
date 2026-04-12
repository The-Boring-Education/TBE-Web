import "@testing-library/jest-dom/vitest";

import type { OnboardingFieldConfig } from "@tbe/types";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

const mockCheckUsernameAvailable = vi.fn();

vi.mock("@tbe/utils/onboarding", () => ({
  checkUsernameAvailable: (...args: unknown[]) =>
    mockCheckUsernameAvailable(...args),
}));

const mockConfig: { fields: OnboardingFieldConfig[] } = {
  fields: [
    {
      name: "userName",
      label: "Username",
      type: "text",
      step: 1,
      required: true,
      checkAvailability: true,
      placeholder: "Enter your username",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      step: 1,
      required: true,
      placeholder: "Enter your email",
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      step: 2,
      required: true,
      options: [
        { value: "student", label: "Student" },
        { value: "professional", label: "Professional" },
      ],
    },
    {
      name: "skills",
      label: "Skills",
      type: "multiselect",
      step: 2,
      required: true,
      options: [
        { value: "js", label: "JavaScript" },
        { value: "python", label: "Python" },
      ],
    },
    {
      name: "phone",
      label: "Phone",
      type: "tel",
      step: 3,
      required: false,
      placeholder: "+91 9876543210",
    },
  ],
};

function makeSetForm() {
  let currentState: Record<string, unknown> = {};
  const fn = vi.fn(
    (
      arg:
        | Record<string, unknown>
        | ((prev: Record<string, unknown>) => Record<string, unknown>),
    ) => {
      if (typeof arg === "function") {
        currentState = (
          arg as (prev: Record<string, unknown>) => Record<string, unknown>
        )(currentState);
      } else {
        currentState = arg;
      }
    },
  );
  return { fn, getState: () => currentState };
}

import OnboardingForm from "@tbe/onboarding/components/OnboardingForm";

describe("OnboardingForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckUsernameAvailable.mockReset();
  });

  it("renders only fields for the current step", () => {
    const { getByPlaceholderText, queryByPlaceholderText } = render(
      <OnboardingForm
        config={mockConfig}
        form={{}}
        setForm={vi.fn()}
        step={1}
        productId="dsayatra"
        apiBaseUrl="http://localhost:3004/api/v1"
      />,
    );
    expect(getByPlaceholderText("Enter your username")).toBeInTheDocument();
    expect(getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(queryByPlaceholderText("+91 9876543210")).not.toBeInTheDocument();
  });

  it("shows step 2 fields when step=2", () => {
    const { getByText, queryByPlaceholderText } = render(
      <OnboardingForm
        config={mockConfig}
        form={{}}
        setForm={vi.fn()}
        step={2}
        productId="dsayatra"
        apiBaseUrl="http://localhost:3004/api/v1"
      />,
    );
    // Role and Skills are rendered as button option text
    expect(getByText("Student")).toBeInTheDocument();
    expect(getByText("JavaScript")).toBeInTheDocument();
    expect(
      queryByPlaceholderText("Enter your username"),
    ).not.toBeInTheDocument();
  });

  it("calls setForm with updated field value on text input change", () => {
    const { fn, getState } = makeSetForm();
    render(
      <OnboardingForm
        config={mockConfig}
        form={{}}
        setForm={fn}
        step={1}
        productId="dsayatra"
        apiBaseUrl="http://localhost:3004/api/v1"
      />,
    );
    fireEvent.change(screen.getByPlaceholderText("Enter your username"), {
      target: { name: "userName", value: "testuser" },
    });
    expect(getState()).toMatchObject({ userName: "testuser" });
  });

  it("calls setForm with updated email on email input change", () => {
    const { fn, getState } = makeSetForm();
    render(
      <OnboardingForm
        config={mockConfig}
        form={{}}
        setForm={fn}
        step={1}
        productId="dsayatra"
        apiBaseUrl="http://localhost:3004/api/v1"
      />,
    );
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { name: "email", value: "test@example.com" },
    });
    expect(getState()).toMatchObject({ email: "test@example.com" });
  });

  it("calls setForm with updated phone on tel input change", () => {
    const { fn, getState } = makeSetForm();
    render(
      <OnboardingForm
        config={mockConfig}
        form={{}}
        setForm={fn}
        step={3}
        productId="dsayatra"
        apiBaseUrl="http://localhost:3004/api/v1"
      />,
    );
    fireEvent.change(screen.getByPlaceholderText("+91 9876543210"), {
      target: { name: "phone", value: "+91 9876543210" },
    });
    expect(getState()).toMatchObject({ phone: "+91 9876543210" });
  });

  it("renders select options as buttons and updates form on click", () => {
    const { fn, getState } = makeSetForm();
    render(
      <OnboardingForm
        config={mockConfig}
        form={{}}
        setForm={fn}
        step={2}
        productId="dsayatra"
        apiBaseUrl="http://localhost:3004/api/v1"
      />,
    );
    fireEvent.click(screen.getByText("Student"));
    expect(getState()).toMatchObject({ role: "student" });
  });

  it("adds option to multiselect on first click", () => {
    const { fn, getState } = makeSetForm();
    render(
      <OnboardingForm
        config={mockConfig}
        form={{}}
        setForm={fn}
        step={2}
        productId="dsayatra"
        apiBaseUrl="http://localhost:3004/api/v1"
      />,
    );
    fireEvent.click(screen.getByText("JavaScript"));
    expect(getState()).toMatchObject({ skills: ["js"] });
  });

  it("removes option from multiselect on second click", () => {
    const { fn, getState } = makeSetForm();
    render(
      <OnboardingForm
        config={mockConfig}
        form={{}}
        setForm={fn}
        step={2}
        productId="dsayatra"
        apiBaseUrl="http://localhost:3004/api/v1"
      />,
    );
    fireEvent.click(screen.getByText("JavaScript"));
    expect(getState()).toMatchObject({ skills: ["js"] });
    fireEvent.click(screen.getByText("JavaScript"));
    expect(getState()).toMatchObject({ skills: [] });
  });

  it("accumulates multiple multiselect options", () => {
    const { fn, getState } = makeSetForm();
    render(
      <OnboardingForm
        config={mockConfig}
        form={{}}
        setForm={fn}
        step={2}
        productId="dsayatra"
        apiBaseUrl="http://localhost:3004/api/v1"
      />,
    );
    fireEvent.click(screen.getByText("JavaScript"));
    fireEvent.click(screen.getByText("Python"));
    expect(getState()).toMatchObject({ skills: ["js", "python"] });
  });

  it("shows loading spinner immediately (debounce has not fired yet)", () => {
    mockCheckUsernameAvailable.mockImplementation(() => new Promise(() => {}));
    render(
      <OnboardingForm
        config={mockConfig}
        form={{ userName: "test" }}
        setForm={vi.fn()}
        step={1}
        productId="dsayatra"
        apiBaseUrl="http://localhost:3004/api/v1"
      />,
    );
    expect(
      screen.getByText("Checking username availability..."),
    ).toBeInTheDocument();
  });

  it("shows 'available' message after debounce fires", async () => {
    mockCheckUsernameAvailable.mockResolvedValue(true);
    render(
      <OnboardingForm
        config={mockConfig}
        form={{ userName: "freename" }}
        setForm={vi.fn()}
        step={1}
        productId="dsayatra"
        apiBaseUrl="http://localhost:3004/api/v1"
      />,
    );
    await waitFor(
      () => {
        expect(screen.getByText("Username is available!")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("shows 'not available' message when username is taken", async () => {
    mockCheckUsernameAvailable.mockResolvedValue(false);
    render(
      <OnboardingForm
        config={mockConfig}
        form={{ userName: "taken" }}
        setForm={vi.fn()}
        step={1}
        productId="dsayatra"
        apiBaseUrl="http://localhost:3004/api/v1"
      />,
    );
    await waitFor(
      () => {
        expect(screen.getByText("Username not available")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("notifies parent of username availability changes after debounce", async () => {
    mockCheckUsernameAvailable.mockResolvedValue(true);
    const onChange = vi.fn();
    render(
      <OnboardingForm
        config={mockConfig}
        form={{ userName: "free" }}
        setForm={vi.fn()}
        step={1}
        productId="dsayatra"
        apiBaseUrl="http://localhost:3004/api/v1"
        onUsernameAvailabilityChange={onChange}
      />,
    );
    await waitFor(
      () => {
        expect(onChange).toHaveBeenCalledWith(true, false);
      },
      { timeout: 3000 },
    );
  });

  it("does not call checkUsernameAvailable for fields without checkAvailability", () => {
    mockCheckUsernameAvailable.mockResolvedValue(false);
    render(
      <OnboardingForm
        config={mockConfig}
        form={{ email: "test@test.com" }}
        setForm={vi.fn()}
        step={1}
        productId="dsayatra"
        apiBaseUrl="http://localhost:3004/api/v1"
      />,
    );
    expect(mockCheckUsernameAvailable).not.toHaveBeenCalled();
  });
});
