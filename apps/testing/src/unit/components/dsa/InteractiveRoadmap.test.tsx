/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";

import type { RoadmapNode } from "@tbe/interface";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore -- relative path bypasses barrel to avoid tsconfig resolution issues
import InteractiveRoadmap from "../../../../../../packages/components/src/containers/Page/common/InteractiveRoadmap";

const sampleNodes: RoadmapNode[] = [
  {
    id: "ARRAY",
    name: "Array",
    total: 0,
    solved: 0,
    isLocked: false,
    explanation: "Linear data structure",
    difficulty: 1,
  },
  {
    id: "STACK",
    name: "Stack",
    total: 0,
    solved: 0,
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

  it("renders all node names as labels", () => {
    render(<InteractiveRoadmap {...defaultProps} />);
    const arrays = screen.getAllByText("Array");
    expect(arrays.length).toBeGreaterThanOrEqual(1);
    const stacks = screen.getAllByText("Stack");
    expect(stacks.length).toBeGreaterThanOrEqual(1);
    const graphs = screen.getAllByText("Graphs");
    expect(graphs.length).toBeGreaterThanOrEqual(1);
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
    fireEvent.click(btn.closest("button")!);
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("does not render back button without label", () => {
    render(<InteractiveRoadmap {...defaultProps} />);
    expect(screen.queryByText("Back to Dashboard")).not.toBeInTheDocument();
  });

  it("calls onNodeClick for non-locked nodes", async () => {
    const onClick = vi.fn();
    render(<InteractiveRoadmap {...defaultProps} onNodeClick={onClick} />);

    const labels = screen.getAllByText("Array");
    fireEvent.click(labels[labels.length - 1]);
    await vi.waitFor(() => {
      expect(onClick).toHaveBeenCalledWith(sampleNodes[0]);
    });
  });

  it("does NOT call onNodeClick for locked nodes", async () => {
    const onClick = vi.fn();
    render(<InteractiveRoadmap {...defaultProps} onNodeClick={onClick} />);

    const labels = screen.getAllByText("Graphs");
    fireEvent.click(labels[labels.length - 1]);
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

  it("uses full-width scroll canvas with left inset (not 100vw under sidebar)", () => {
    render(<InteractiveRoadmap {...defaultProps} />);
    const scroll = screen.getByTestId("roadmap-canvas-scroll");
    expect(scroll).toHaveClass("w-full");
    expect(scroll).not.toHaveClass("w-[100vw]");
    expect(scroll).toHaveClass("scroll-pl-6");
    expect(scroll).toHaveClass("lg:scroll-pl-12");
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
    render(
      <InteractiveRoadmap
        nodes={[]}
        onNodeClick={vi.fn()}
        title={<span data-testid="empty-title">EMPTY</span>}
      />,
    );
    expect(screen.getByTestId("empty-title")).toBeInTheDocument();
  });
});
