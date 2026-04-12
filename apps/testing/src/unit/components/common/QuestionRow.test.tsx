import { QuestionRow } from "@tbe/components";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

describe("QuestionRow", () => {
  it("renders title", () => {
    render(<QuestionRow name="Two Sum" />);
    expect(screen.getByText("Two Sum")).toBeInTheDocument();
  });

  it("calls onClick when row is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<QuestionRow name="A" onClick={onClick} />);
    await user.click(screen.getByTestId("tbe-question-row"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("calls onToggleComplete when complete button is clicked without firing row onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onToggleComplete = vi.fn();
    render(
      <QuestionRow
        name="B"
        onClick={onClick}
        onToggleComplete={onToggleComplete}
      />,
    );
    await user.click(screen.getByTestId("tbe-question-row-complete"));
    expect(onToggleComplete).toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("shows real-world badge when isRealWorldProblem", () => {
    render(<QuestionRow name="C" isRealWorldProblem />);
    expect(
      screen.getByTestId("tbe-question-row-real-world"),
    ).toBeInTheDocument();
    expect(screen.getByText("Real World")).toBeInTheDocument();
  });

  it("shows notes dot when hasNotes", () => {
    render(<QuestionRow name="D" hasNotes />);
    expect(
      screen.getByTestId("tbe-question-row-notes-dot"),
    ).toBeInTheDocument();
  });
});
