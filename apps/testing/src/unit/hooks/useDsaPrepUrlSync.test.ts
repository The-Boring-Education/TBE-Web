import { useDsaPrepUrlSync } from "@tbe/hooks/useDsaPrepUrlSync";
import type { DsaQuestion } from "@tbe/interface";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// useDsaPrepUrlSync takes `router` as a plain prop (NextRouter shape), so we
// can pass an in-memory double directly — no module mocking needed.
function createMockRouter(overrides: Partial<any> = {}) {
  return {
    isReady: true,
    pathname: "/prep/dsa",
    query: {},
    replace: vi.fn(),
    ...overrides,
  };
}

const questions: DsaQuestion[] = [
  {
    id: "q1",
    name: "Two Sum",
    difficultyLevel: "EASY",
    topics: ["ARRAY"],
    answer: "",
  },
];

describe("useDsaPrepUrlSync", () => {
  let setSelectedTopic: ReturnType<typeof vi.fn>;
  let setSelectedQuestion: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setSelectedTopic = vi.fn();
    setSelectedQuestion = vi.fn();
  });

  it("does nothing while the router is not ready", () => {
    const router = createMockRouter({ isReady: false });

    renderHook(() =>
      useDsaPrepUrlSync({
        router,
        selectedTopic: null,
        setSelectedTopic,
        setSelectedQuestion,
        topicQuestions: [],
        topicQuestionsLoading: false,
      }),
    );

    expect(setSelectedTopic).not.toHaveBeenCalled();
  });

  it("hydrates selectedTopic from the `topic` query param on load", () => {
    const router = createMockRouter({ query: { topic: "array" } });

    renderHook(() =>
      useDsaPrepUrlSync({
        router,
        selectedTopic: null,
        setSelectedTopic,
        setSelectedQuestion,
        topicQuestions: [],
        topicQuestionsLoading: false,
      }),
    );

    expect(setSelectedTopic).toHaveBeenCalledWith("ARRAY");
  });

  it("clears selectedTopic and replaces the query when the topic can't be decoded", () => {
    const router = createMockRouter({ query: { topic: "" } });

    renderHook(() =>
      useDsaPrepUrlSync({
        router,
        selectedTopic: null,
        setSelectedTopic,
        setSelectedQuestion,
        topicQuestions: [],
        topicQuestionsLoading: false,
      }),
    );

    expect(setSelectedTopic).toHaveBeenCalledWith(null);
  });

  it("resolves selectedQuestion from the `question` query param once topic questions load", () => {
    const router = createMockRouter({
      query: { topic: "array", question: "two-sum" },
    });

    renderHook(() =>
      useDsaPrepUrlSync({
        router,
        selectedTopic: "ARRAY",
        setSelectedTopic,
        setSelectedQuestion,
        topicQuestions: questions,
        topicQuestionsLoading: false,
      }),
    );

    expect(setSelectedQuestion).toHaveBeenCalledWith(questions[0]);
  });

  it("handleTopicClick sets the topic and replaces the query", () => {
    const router = createMockRouter();

    const { result } = renderHook(() =>
      useDsaPrepUrlSync({
        router,
        selectedTopic: null,
        setSelectedTopic,
        setSelectedQuestion,
        topicQuestions: [],
        topicQuestionsLoading: false,
      }),
    );

    result.current.handleTopicClick("ARRAY");

    expect(setSelectedTopic).toHaveBeenCalledWith("ARRAY");
    expect(setSelectedQuestion).toHaveBeenCalledWith(null);
    expect(router.replace).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ topic: expect.any(String) }),
      }),
      undefined,
      { shallow: true },
    );
  });

  it("handleBackToTopics clears both selections and the query", () => {
    const router = createMockRouter();

    const { result } = renderHook(() =>
      useDsaPrepUrlSync({
        router,
        selectedTopic: "ARRAY",
        setSelectedTopic,
        setSelectedQuestion,
        topicQuestions: questions,
        topicQuestionsLoading: false,
      }),
    );

    result.current.handleBackToTopics();

    expect(setSelectedTopic).toHaveBeenCalledWith(null);
    expect(setSelectedQuestion).toHaveBeenCalledWith(null);
    expect(router.replace).toHaveBeenCalledWith(
      expect.objectContaining({ query: {} }),
      undefined,
      { shallow: true },
    );
  });
});
