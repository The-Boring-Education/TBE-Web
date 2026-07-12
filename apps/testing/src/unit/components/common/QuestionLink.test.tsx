import { QuestionLink } from "@tbe/components";
import { ANALYTICS_EVENTS } from "@tbe/constants";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLegacyTrackEvent = vi.fn();
const mockSendEvent = vi.fn();

vi.mock("@tbe/hooks", () => ({
  useAnalytics: () => ({ trackEvent: mockLegacyTrackEvent }),
}));

vi.mock("@tbe/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tbe/utils")>();
  return {
    ...actual,
    trackEvent: (...args: unknown[]) => mockSendEvent(...args),
  };
});

describe("QuestionLink analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseProps = {
    href: "#question-1",
    questionId: "q-1",
    title: "Two Sum",
    question: { id: "q-1" },
    isCompleted: false,
    currentQuestionId: "q-2",
    frequency: "medium",
    handleQuestionClick: vi.fn(),
  };

  it("fires QUESTION_START via legacy and registry trackEvent when unlocked", async () => {
    const user = userEvent.setup();
    render(<QuestionLink {...baseProps} isLocked={false} />);

    await user.click(screen.getByRole("link", { name: /Two Sum/i }));

    expect(mockLegacyTrackEvent).toHaveBeenCalledWith({
      action: ANALYTICS_EVENTS.QUESTION_START,
      category: "Learning",
      label: "Question Started",
      value: expect.objectContaining({ questionId: "q-1" }),
    });
    expect(mockSendEvent).toHaveBeenCalledWith(
      ANALYTICS_EVENTS.QUESTION_START,
      expect.objectContaining({
        category: "learning",
        questionId: "q-1",
        title: "Two Sum",
      }),
    );
    expect(baseProps.handleQuestionClick).toHaveBeenCalled();
  });

  it("does not fire analytics when locked", async () => {
    const user = userEvent.setup();
    render(<QuestionLink {...baseProps} isLocked />);

    await user.click(screen.getByRole("link", { name: /Two Sum/i }));

    expect(mockLegacyTrackEvent).not.toHaveBeenCalled();
    expect(mockSendEvent).not.toHaveBeenCalled();
    expect(baseProps.handleQuestionClick).not.toHaveBeenCalled();
  });
});
