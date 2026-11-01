import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRouter } = vi.hoisted(() => ({
  mockRouter: {
    push: vi.fn(),
    replace: vi.fn(),
    pathname: "/pattern-quiz",
    asPath: "/pattern-quiz",
    query: {},
  },
}));

vi.mock("next/router", () => ({
  useRouter: () => mockRouter,
}));

vi.mock("next/head", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock("@tbe/components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tbe/components")>();
  return {
    ...actual,
    SEO: () => null,
    ContentFeedbackWidget: ({ contentType, contentId, title }: any) => (
      <div
        data-testid="content-feedback-widget"
        data-content-type={contentType}
        data-content-id={contentId}
      >
        {title}
      </div>
    ),
  };
});

import PatternQuizPage from "../../../../dsayatra/src/pages/pattern-quiz";

describe("DSA Yatra Pattern Quiz Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page header, breadcrumbs, and feedback widget", () => {
    render(<PatternQuizPage />);

    // Breadcrumb verification
    const dashboardLink = screen.getByRole("link", { name: "DSA Yatra" });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");
    expect(screen.getByText("Pattern Quiz")).toBeInTheDocument();

    // Feedback widget verification
    const feedback = screen.getByTestId("content-feedback-widget");
    expect(feedback).toBeInTheDocument();
    expect(feedback).toHaveAttribute("data-content-type", "QUIZ");
    expect(feedback).toHaveAttribute("data-content-id", "pattern-quiz");
  });

  it("renders the idle start screen with assessment details", () => {
    render(<PatternQuizPage />);

    expect(
      screen.getByRole("heading", { name: /DSA Pattern Quiz/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Train your algorithmic intuition/i),
    ).toBeInTheDocument();

    // Feature specs
    expect(screen.getByText(/5 Qs/i)).toBeInTheDocument();
    expect(screen.getByText(/12\+ Patterns/i)).toBeInTheDocument();
    expect(screen.getByText(/Adaptive/i)).toBeInTheDocument();

    // Start button
    expect(
      screen.getByRole("button", { name: /Start Assessment/i }),
    ).toBeInTheDocument();
  });

  it("starts assessment and handles question answering flow through submission", () => {
    render(<PatternQuizPage />);

    // 1. Click Start Assessment
    const startBtn = screen.getByRole("button", { name: /Start Assessment/i });
    fireEvent.click(startBtn);

    // 2. Active assessment shell should appear
    expect(
      screen.getByRole("heading", { name: /DSA Pattern Challenge/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Question 1/i)).toBeInTheDocument();
    expect(screen.getByText("1 / 5")).toBeInTheDocument();

    // Next button should be disabled when nothing selected
    const nextBtn = screen.getByRole("button", { name: /Next/i });
    expect(nextBtn).toBeDisabled();

    // 3. Answer questions 1 to 4
    for (let i = 0; i < 4; i++) {
      // Pick an option button (e.g. option A or B)
      const optionButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.textContent?.match(/^[A-D]/));
      expect(optionButtons.length).toBeGreaterThan(0);
      fireEvent.click(optionButtons[0]);

      // Click Next
      const activeNextBtn = screen.getByRole("button", { name: /Next/i });
      expect(activeNextBtn).not.toBeDisabled();
      fireEvent.click(activeNextBtn);
    }

    // 4. On Question 5, Submit Quiz button should appear
    expect(screen.getByText("5 / 5")).toBeInTheDocument();
    const submitBtn = screen.getByRole("button", { name: /Submit Quiz/i });
    expect(submitBtn).toBeDisabled();

    // Pick an option for question 5
    const finalOptions = screen
      .getAllByRole("button")
      .filter((btn) => btn.textContent?.match(/^[A-D]/));
    expect(finalOptions.length).toBeGreaterThan(0);
    fireEvent.click(finalOptions[0]);

    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    // 5. Results screen should be rendered
    expect(screen.getByText(/Assessment Completed/i)).toBeInTheDocument();
    expect(screen.getByText("Accuracy")).toBeInTheDocument();
    expect(screen.getByText("Score")).toBeInTheDocument();
    expect(screen.getAllByText(/Incorrect/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Mastery")).toBeInTheDocument();

    // Retake Quiz and Dashboard buttons
    expect(
      screen.getByRole("button", { name: /Retake Quiz/i }),
    ).toBeInTheDocument();
    const dashboardBtn = screen.getByRole("button", {
      name: /Go to Dashboard/i,
    });
    expect(dashboardBtn).toBeInTheDocument();

    // Clicking Go to Dashboard
    fireEvent.click(dashboardBtn);
    expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
  });

  it("supports retaking quiz from results screen", () => {
    render(<PatternQuizPage />);

    // Start quiz
    fireEvent.click(screen.getByRole("button", { name: /Start Assessment/i }));

    // Answer questions 1 to 4
    for (let i = 0; i < 4; i++) {
      const options = screen
        .getAllByRole("button")
        .filter((btn) => btn.textContent?.match(/^[A-D]/));
      fireEvent.click(options[0]);
      fireEvent.click(screen.getByRole("button", { name: /Next/i }));
    }

    // Submit question 5
    const lastOptions = screen
      .getAllByRole("button")
      .filter((btn) => btn.textContent?.match(/^[A-D]/));
    fireEvent.click(lastOptions[0]);
    fireEvent.click(screen.getByRole("button", { name: /Submit Quiz/i }));

    // On results screen, click Retake Quiz
    const retakeBtn = screen.getByRole("button", { name: /Retake Quiz/i });
    fireEvent.click(retakeBtn);

    // Should restart back to Question 1 of a new quiz
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /DSA Pattern Challenge/i }),
    ).toBeInTheDocument();
  });
});
