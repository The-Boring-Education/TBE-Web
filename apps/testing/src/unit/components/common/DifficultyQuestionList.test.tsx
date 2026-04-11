import { DifficultyQuestionList } from "@tbe/components";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

type Row = { id: string; title: string; difficulty: string };

const sample: Row[] = [
  { id: "1", title: "Easy Q", difficulty: "EASY" },
  { id: "2", title: "Hard Q", difficulty: "HARD" },
];

describe("DifficultyQuestionList", () => {
  it("renders difficulty groups and question titles", () => {
    render(
      <DifficultyQuestionList<Row>
        items={sample}
        getDifficulty={(q) => q.difficulty}
        getItemKey={(q) => q.id}
        resolveRow={(q) => ({
          name: q.title,
        })}
      />,
    );

    expect(screen.getByText("Easy")).toBeInTheDocument();
    expect(screen.getByText("Hard")).toBeInTheDocument();
    expect(screen.getByText("Easy Q")).toBeInTheDocument();
    expect(screen.getByText("Hard Q")).toBeInTheDocument();
  });

  it("invokes onItemClick and onToggleItemComplete with item and key", async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();
    const onToggleItemComplete = vi.fn();

    render(
      <DifficultyQuestionList<Row>
        items={sample}
        getDifficulty={(q) => q.difficulty}
        getItemKey={(q) => q.id}
        resolveRow={(q) => ({ name: q.title })}
        onItemClick={onItemClick}
        onToggleItemComplete={onToggleItemComplete}
      />,
    );

    await user.click(screen.getByText("Easy Q"));
    expect(onItemClick).toHaveBeenCalledWith(sample[0]);

    await user.click(screen.getAllByTestId("tbe-question-row-complete")[0]);
    expect(onToggleItemComplete).toHaveBeenCalledWith(sample[0], "1");
  });

  it("shows empty message when no items", () => {
    render(
      <DifficultyQuestionList<Row>
        items={[]}
        getDifficulty={(q) => q.difficulty}
        getItemKey={(q) => q.id}
        resolveRow={() => ({ name: "" })}
        emptyMessage="Nothing here."
      />,
    );
    expect(screen.getByText("Nothing here.")).toBeInTheDocument();
  });
});
