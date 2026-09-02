import { LinerProgressBar } from "@tbe/components";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tbe/interface", () => ({}));

describe("LinerProgressBar Component", () => {
  it("shows correct text for partial completion", () => {
    render(<LinerProgressBar totalChapters={10} completedChapters={5} />);
    expect(screen.getByText(/5 \/ 10 Chapters/)).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("shows 0% when totalChapters is 0 (edge case)", () => {
    render(<LinerProgressBar totalChapters={0} completedChapters={0} />);
    expect(screen.getByText(/0 \/ 0 Chapters/)).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("shows 100% when all chapters complete", () => {
    render(<LinerProgressBar totalChapters={8} completedChapters={8} />);
    expect(screen.getByText(/8 \/ 8 Chapters/)).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("progress bar width matches percentage", () => {
    const { container } = render(
      <LinerProgressBar totalChapters={4} completedChapters={2} />,
    );
    const progressBar = container.querySelector(".bg-success");
    expect(progressBar).toHaveStyle({ width: "50%" });
  });

  it("handles 0 completed chapters", () => {
    render(<LinerProgressBar totalChapters={5} completedChapters={0} />);
    expect(screen.getByText(/0 \/ 5 Chapters/)).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("uses Math.floor (e.g., 1/3 = 33%, not 33.33%)", () => {
    render(<LinerProgressBar totalChapters={3} completedChapters={1} />);
    expect(screen.getByText(/1 \/ 3 Chapters/)).toBeInTheDocument();
    expect(screen.getByText("33%")).toBeInTheDocument();
  });
});
