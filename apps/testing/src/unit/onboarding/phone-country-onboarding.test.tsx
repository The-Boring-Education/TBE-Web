import type { StepPhoneNumberProps } from "@tbe/interface";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";

import StepPhoneNumber from "../../../../../packages/components/src/containers/Page/Onboarding/StepPhoneNumber";
import OnboardingPage from "../../../../platform/src/pages/onboarding";

const { makeRequest } = vi.hoisted(() => ({
  makeRequest: vi.fn().mockResolvedValue({ status: false }),
}));

vi.mock("@tbe/constants", async () => {
  const { COUNTRY_CODES } = await import(
    "../../../../../packages/constants/src/global"
  );
  return {
    COUNTRY_CODES,
    routes: { api: { onboard: "/onboarding" }, onboarding: "/onboarding" },
  };
});

vi.mock("@tbe/utils", async () => {
  const { isPossibleMobileNumber, splitContactNumber } = await import(
    "../../../../../packages/utils/src/phoneNumber"
  );
  return {
    isPossibleMobileNumber,
    splitContactNumber,
    getPreFetchProps: vi.fn(),
    getRedirectUrl: () => "/",
  };
});

vi.mock("@tbe/hooks", () => ({
  useUser: () => ({
    user: { id: "phone-test-user", isOnboarded: false },
    updateSession: vi.fn(),
  }),
  useApi: () => ({ makeRequest }),
}));

vi.mock("@tbe/components", () => {
  const Container = ({ children }: PropsWithChildren) => <div>{children}</div>;
  return {
    FlexContainer: Container,
    OnboardingLayout: Container,
    Text: Container,
    OnboardingProgressBar: () => null,
    SectionHeaderContainer: () => null,
    SEO: () => null,
    Toast: () => null,
    StepPhoneNumber: (props: StepPhoneNumberProps) => (
      <StepPhoneNumber {...props} />
    ),
    InputFieldContainer: ({
      value,
      onChange,
    }: {
      value: string;
      onChange: (value: string) => void;
    }) => (
      <input
        aria-label="Phone Number"
        type="tel"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    ),
    SelectInput: ({
      list,
      selectedItem,
      onChange,
    }: {
      list: string[];
      selectedItem: string;
      onChange: (value: string) => void;
    }) => (
      <select
        aria-label="Country Code"
        value={selectedItem}
        onChange={(event) => onChange(event.target.value)}
      >
        {list.map((code) => (
          <option key={code}>{code}</option>
        ))}
      </select>
    ),
    StepUsername: ({
      onChange,
      setIsUsernameAvailable,
    }: {
      onChange: (value: string) => void;
      setIsUsernameAvailable: (value: boolean) => void;
    }) => (
      <button
        onClick={() => {
          onChange("phone-user");
          setIsUsernameAvailable(true);
        }}
      >
        Set username
      </button>
    ),
    StepOccupation: ({ onChange }: { onChange: (value: string) => void }) => (
      <button onClick={() => onChange("TECH_STUDENT")}>Set occupation</button>
    ),
    StepUsage: ({ onChange }: { onChange: (value: string[]) => void }) => (
      <button onClick={() => onChange(["LEARNING_TECH"])}>Set purpose</button>
    ),
    StepNavigation: ({
      isValid,
      isLastStep,
      onNext,
      onSubmit,
    }: {
      isValid: boolean;
      isLastStep: boolean;
      onNext: () => void;
      onSubmit: () => void;
    }) => (
      <button disabled={!isValid} onClick={isLastStep ? onSubmit : onNext}>
        {isLastStep ? "Submit" : "Next"}
      </button>
    ),
  };
});

const renderPhoneStep = () => {
  render(
    <OnboardingPage
      slug="onboarding"
      seoMeta={{
        title: "Onboarding",
        siteName: "",
        description: "",
        url: "",
        type: "",
        robots: "",
        image: "",
        keywords: "",
        author: "",
        publisher: "",
        linkedIn: "",
        instagram: "",
        github: "",
      }}
    />,
  );
  for (const label of ["Set username", "Set occupation", "Set purpose"]) {
    fireEvent.click(screen.getByRole("button", { name: label }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
  }
};

describe("onboarding international phone regression", () => {
  it("preserves every digit emitted by the phone input", () => {
    const onChangeNumber = vi.fn();
    render(
      <StepPhoneNumber
        countryCode="+86"
        phoneNumber=""
        onChangeCode={vi.fn()}
        onChangeNumber={onChangeNumber}
      />,
    );
    fireEvent.change(screen.getByLabelText("Phone Number"), {
      target: { value: "138 0013-800012345" },
    });
    expect(onChangeNumber).toHaveBeenCalledWith("1380013800012345");
  });

  it.each([
    ["+86", "13800138000"],
    ["+49", "15123456789"],
    ["+44", "07700900123"],
    ["+47", "41234567"],
    ["+91", "9876543210"],
    ["+31", "97012345678"],
  ])("submits the complete %s number", async (code, number) => {
    renderPhoneStep();
    fireEvent.change(screen.getByLabelText("Country Code"), {
      target: { value: code },
    });
    fireEvent.change(screen.getByLabelText("Phone Number"), {
      target: { value: number },
    });
    expect(screen.getByLabelText("Phone Number")).toHaveValue(number);
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() =>
      expect(makeRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({ contactNo: `${code} ${number}` }),
        }),
      ),
    );
  });

  it("revalidates on country changes without deleting digits", () => {
    renderPhoneStep();
    const submit = screen.getByRole("button", { name: "Submit" });
    expect(submit).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Phone Number"), {
      target: { value: "13800138000" },
    });
    expect(submit).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Country Code"), {
      target: { value: "+86" },
    });
    expect(submit).toBeEnabled();
    expect(screen.getByLabelText("Phone Number")).toHaveValue("13800138000");
    fireEvent.change(screen.getByLabelText("Country Code"), {
      target: { value: "+91" },
    });
    expect(submit).toBeDisabled();
    expect(screen.getByLabelText("Phone Number")).toHaveValue("13800138000");
    fireEvent.change(screen.getByLabelText("Phone Number"), {
      target: { value: "1380013800012345" },
    });
    expect(submit).toBeDisabled();
    expect(screen.getByLabelText("Phone Number")).toHaveValue("1380013800012345");
  });
});
