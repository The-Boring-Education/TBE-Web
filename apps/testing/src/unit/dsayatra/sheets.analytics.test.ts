import { ANALYTICS_EVENTS } from "@tbe/constants";
import { trackEvent } from "@tbe/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tbe/utils")>();
  return {
    ...actual,
    trackEvent: vi.fn(),
  };
});

/** Mirrors dsayatra sheets page question-selection analytics contract. */
const trackDsaQuestionView = (
  question: { _id?: string; id?: string | number },
  selectedTopic: string | null,
) => {
  trackEvent(ANALYTICS_EVENTS.DSA_QUESTION_VIEW, {
    question_id: String(question._id ?? question.id),
    topic: selectedTopic ?? undefined,
  });
};

describe("dsayatra sheets analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fires dsa_question_view with question_id and topic", () => {
    trackDsaQuestionView({ _id: "abc123" }, "arrays");

    expect(trackEvent).toHaveBeenCalledWith(
      ANALYTICS_EVENTS.DSA_QUESTION_VIEW,
      {
        question_id: "abc123",
        topic: "arrays",
      },
    );
  });

  it("falls back to id when _id is missing", () => {
    trackDsaQuestionView({ id: 42 }, null);

    expect(trackEvent).toHaveBeenCalledWith(
      ANALYTICS_EVENTS.DSA_QUESTION_VIEW,
      {
        question_id: "42",
        topic: undefined,
      },
    );
  });
});
