/**
 * @vitest-environment jsdom
 */
import type { RoadmapNode } from "@tbe/interface";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import InteractiveRoadmap from "../../../../../../packages/components/src/containers/Page/common/InteractiveRoadmap";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const sampleNodes: RoadmapNode[] = [
  {
    id: "ARRAY",
    name: "Array",
    total: 10,
    solved: 10,
    isLocked: false,
    explanation: "Linear data structure",
    difficulty: 1,
  },
  {
    id: "STACK",
    name: "Stack",
    total: 5,
    solved: 2,
    isLocked: false,
    explanation: "LIFO data structure",
    difficulty: 3,
  },
  {
    id: "GRAPH",
    name: "Graphs",
    total: 0,
    solved: 0,
    isLocked: true,
    explanation: "Coming soon",
    difficulty: 5,
  },
];

describe("InteractiveRoadmap", () => {
  const defaultProps = {
    nodes: sampleNodes,
    onNodeClick: vi.fn(),
    title: <span data-testid="roadmap-title">ROADMAP</span>,
  };

  it("renders the title", () => {
    render(<InteractiveRoadmap {...defaultProps} />);
    expect(screen.getByTestId("roadmap-title")).toBeInTheDocument();
    expect(screen.getByTestId("roadmap-title").textContent).toBe("ROADMAP");
  });

  it("renders subtitle when provided", () => {
    render(
      <InteractiveRoadmap {...defaultProps} subtitle="Learn step by step" />,
    );
    expect(screen.getByText("Learn step by step")).toBeInTheDocument();
  });

  it("renders all node names", () => {
    render(<InteractiveRoadmap {...defaultProps} />);
    expect(screen.getByText("Array")).toBeInTheDocument();
    expect(screen.getByText("Stack")).toBeInTheDocument();
    expect(screen.getByText("Graphs")).toBeInTheDocument();
  });

  it("renders node explanations in tooltips", () => {
    render(<InteractiveRoadmap {...defaultProps} />);
    expect(screen.getByText("Linear data structure")).toBeInTheDocument();
    expect(screen.getByText("LIFO data structure")).toBeInTheDocument();
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });

  it("renders stats when provided", () => {
    render(
      <InteractiveRoadmap
        {...defaultProps}
        stats={[
          { label: "Topics", value: 7 },
          { label: "Mastered", value: 3 },
        ]}
      />,
    );
    expect(screen.getByText("Topics")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Mastered")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders progress bar when overallProgress is provided", () => {
    render(<InteractiveRoadmap {...defaultProps} overallProgress={42} />);
    expect(screen.getByText("Overall Progress")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
  });

  it("does not render progress bar without overallProgress", () => {
    render(<InteractiveRoadmap {...defaultProps} />);
    expect(screen.queryByText("Overall Progress")).not.toBeInTheDocument();
  });

  it("renders back button when configured", () => {
    const onBack = vi.fn();
    render(
      <InteractiveRoadmap
        {...defaultProps}
        backButtonLabel="Back to Dashboard"
        onBackClick={onBack}
      />,
    );
    const btn = screen.getByText("Back to Dashboard");
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("does not render back button without label", () => {
    render(<InteractiveRoadmap {...defaultProps} />);
    expect(screen.queryByText("Back to Dashboard")).not.toBeInTheDocument();
  });

  it("calls onNodeClick for non-locked nodes", async () => {
    const onClick = vi.fn();
    render(<InteractiveRoadmap {...defaultProps} onNodeClick={onClick} />);

    fireEvent.click(screen.getByText("Array"));
    await vi.waitFor(() => {
      expect(onClick).toHaveBeenCalledWith(sampleNodes[0]);
    });
  });

  it("does NOT call onNodeClick for locked nodes", async () => {
    const onClick = vi.fn();
    render(<InteractiveRoadmap {...defaultProps} onNodeClick={onClick} />);

    fireEvent.click(screen.getByText("Graphs"));
    await new Promise((r) => setTimeout(r, 600));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders node numbers padded to 2 digits", () => {
    render(<InteractiveRoadmap {...defaultProps} />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
  });

  it("renders scroll hint", () => {
    render(<InteractiveRoadmap {...defaultProps} />);
    expect(screen.getByText("► scroll horizontally ►")).toBeInTheDocument();
  });

  it("renders SVG paths in the canvas", () => {
    const { container } = render(<InteractiveRoadmap {...defaultProps} />);
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBeGreaterThanOrEqual(2);
  });

  it("applies custom className", () => {
    const { container } = render(
      <InteractiveRoadmap {...defaultProps} className="my-custom-class" />,
    );
    expect(container.firstElementChild).toHaveClass("my-custom-class");
  });

  it("renders with empty nodes without crashing", () => {
    render(<InteractiveRoadmap {...defaultProps} nodes={[]} />);
    expect(screen.getByTestId("roadmap-title")).toBeInTheDocument();
  });
});
