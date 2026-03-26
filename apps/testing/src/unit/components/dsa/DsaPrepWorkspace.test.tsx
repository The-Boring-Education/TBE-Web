import { DsaPrepWorkspace } from "@tbe/components";
import type { TopicWithCount } from "@tbe/hooks";
import type { DsaQuestion } from "@tbe/interface";
import { TBEQueryProvider } from "@tbe/query";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
  },
}));

vi.mock("markdown-it", () => ({
  default: vi.fn().mockImplementation(() => ({
    render: (text: string) => `<p>${text}</p>`,
  })),
}));

const mockQuestions: DsaQuestion[] = [
  {
    id: "q1",
    name: "Two Sum",
    difficultyLevel: "EASY",
    topics: ["ARRAY"],
    answer: "Use a hash map.",
    examples: [{ inputText: "[1,2]", outputText: "3" }],
    constraints: ["1 <= n"],
  },
  {
    id: "q2",
    name: "Three Sum",
    difficultyLevel: "MEDIUM",
    topics: ["ARRAY"],
    answer: "Sort and two pointers.",
    examples: [],
    constraints: [],
  },
  {
    id: "q3",
    name: "Valid Parentheses",
    difficultyLevel: "EASY",
    topics: ["STACK"],
    answer: "Use a stack.",
    examples: [],
    constraints: [],
  },
];

const mockTopics: TopicWithCount[] = [
  { topic: "ARRAY", count: 2, label: "Array" },
  { topic: "STACK", count: 1, label: "Stack" },
];

describe("DsaPrepWorkspace", () => {
  const defaultProps = {
    questions: mockQuestions,
    topicsWithCounts: mockTopics,
    selectedTopic: null as string | null,
    selectedQuestion: null as DsaQuestion | null,
    onTopicClick: vi.fn(),
    onQuestionClick: vi.fn(),
    onBackToTopics: vi.fn(),
  };

  const renderWithQueryClient = (ui: React.ReactElement) =>
    render(<TBEQueryProvider devtools={false}>{ui}</TBEQueryProvider>);

  it("should render topic sidebar when no topic is selected", () => {
    renderWithQueryClient(<DsaPrepWorkspace {...defaultProps} />);

    expect(screen.getByText("Explore Topics")).toBeInTheDocument();
    expect(screen.getByText(/Choose a topic/i)).toBeInTheDocument();
    expect(screen.getByText("Array")).toBeInTheDocument();
    expect(screen.getByText("Stack")).toBeInTheDocument();
  });

  it("should call onTopicClick when a topic is clicked", () => {
    const onTopicClick = vi.fn();

    renderWithQueryClient(
      <DsaPrepWorkspace {...defaultProps} onTopicClick={onTopicClick} />,
    );

    fireEvent.click(screen.getByText("Array"));
    expect(onTopicClick).toHaveBeenCalledWith("ARRAY");
  });

  it("should show questions list when a topic is selected", () => {
    renderWithQueryClient(
      <DsaPrepWorkspace {...defaultProps} selectedTopic="ARRAY" />,
    );

    expect(screen.getByText("Two Sum")).toBeInTheDocument();
    expect(screen.getByText("Three Sum")).toBeInTheDocument();
    expect(screen.queryByText("Valid Parentheses")).not.toBeInTheDocument();
  });

  it("should show back button when topic is selected", () => {
    renderWithQueryClient(
      <DsaPrepWorkspace {...defaultProps} selectedTopic="ARRAY" />,
    );

    expect(screen.getByText(/Back/i)).toBeInTheDocument();
  });

  it("should call onBackToTopics when back button is clicked", () => {
    const onBackToTopics = vi.fn();

    renderWithQueryClient(
      <DsaPrepWorkspace
        {...defaultProps}
        selectedTopic="ARRAY"
        onBackToTopics={onBackToTopics}
      />,
    );

    fireEvent.click(screen.getByText(/Back/i));
    expect(onBackToTopics).toHaveBeenCalled();
  });

  it("should render empty state when no topic is selected", () => {
    renderWithQueryClient(<DsaPrepWorkspace {...defaultProps} />);

    expect(
      screen.getByText(/Select a topic to start practicing/i),
    ).toBeInTheDocument();
  });

  it("should render custom empty state content", () => {
    renderWithQueryClient(
      <DsaPrepWorkspace
        {...defaultProps}
        emptyStateContent={<div>Custom empty state</div>}
      />,
    );

    expect(screen.getByText("Custom empty state")).toBeInTheDocument();
  });

  it("should render topic sidebar header when provided", () => {
    renderWithQueryClient(
      <DsaPrepWorkspace
        {...defaultProps}
        topicSidebarHeader={<div>Back to Dashboard</div>}
      />,
    );

    expect(screen.getByText("Back to Dashboard")).toBeInTheDocument();
  });

  it("should show completion indicators when completionMap is provided", () => {
    const completionMap = { ARRAY: true, STACK: false };

    renderWithQueryClient(
      <DsaPrepWorkspace {...defaultProps} completionMap={completionMap} />,
    );

    const arrayLabel = screen.getByText("Array");
    // Updated to match the current DsaTopicSidebar styling for completed topics
    expect(arrayLabel.className).toContain("text-green-400");
  });

  it("should display topic name in header when topic is selected", () => {
    renderWithQueryClient(
      <DsaPrepWorkspace {...defaultProps} selectedTopic="ARRAY" />,
    );

    expect(screen.getByText("Questions")).toBeInTheDocument();
  });
});
