import { DsaTopicSidebar } from "@tbe/components";
import type { TopicWithCount } from "@tbe/hooks";
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

const mockTopics: TopicWithCount[] = [
  { topic: "ARRAY", count: 15, label: "Array" },
  { topic: "STRING", count: 10, label: "String" },
  { topic: "STACK", count: 8, label: "Stack" },
];

describe("DsaTopicSidebar", () => {
  it("should render all topics", () => {
    render(
      <DsaTopicSidebar
        topics={mockTopics}
        selectedTopic={null}
        onTopicClick={() => {}}
      />,
    );

    expect(screen.getByText("Array")).toBeInTheDocument();
    expect(screen.getByText("String")).toBeInTheDocument();
    expect(screen.getByText("Stack")).toBeInTheDocument();
  });

  it("should display topic counts", () => {
    render(
      <DsaTopicSidebar
        topics={mockTopics}
        selectedTopic={null}
        onTopicClick={() => {}}
      />,
    );

    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("should display numbered indices", () => {
    render(
      <DsaTopicSidebar
        topics={mockTopics}
        selectedTopic={null}
        onTopicClick={() => {}}
      />,
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should call onTopicClick when a topic is clicked", () => {
    const onTopicClick = vi.fn();

    render(
      <DsaTopicSidebar
        topics={mockTopics}
        selectedTopic={null}
        onTopicClick={onTopicClick}
      />,
    );

    fireEvent.click(screen.getByText("Array"));
    expect(onTopicClick).toHaveBeenCalledWith("ARRAY");

    fireEvent.click(screen.getByText("Stack"));
    expect(onTopicClick).toHaveBeenCalledWith("STACK");
  });

  it("should apply completion styles when completionMap is provided", () => {
    const completionMap = {
      ARRAY: true,
      STRING: false,
      STACK: false,
    };

    render(
      <DsaTopicSidebar
        topics={mockTopics}
        selectedTopic={null}
        onTopicClick={() => {}}
        completionMap={completionMap}
      />,
    );

    const arrayLabel = screen.getByText("Array");
    expect(arrayLabel.className).toContain("text-green-500");
  });

  it("should render without completionMap", () => {
    render(
      <DsaTopicSidebar
        topics={mockTopics}
        selectedTopic={null}
        onTopicClick={() => {}}
      />,
    );

    expect(screen.getByText("Array")).toBeInTheDocument();
  });

  it("should handle empty topics array", () => {
    const { container } = render(
      <DsaTopicSidebar
        topics={[]}
        selectedTopic={null}
        onTopicClick={() => {}}
      />,
    );

    expect(container.querySelector("[data-topic]")).toBeNull();
  });
});
