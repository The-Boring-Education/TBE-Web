import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import InterviewQuestionContent from "../../../../platform/src/components/InterviewQuestionContent";

vi.mock(
  "../../../../platform/src/components/InterviewSheetMDXRenderer",
  () => ({
    InterviewSheetMDXRenderer: ({ mdxSource }: { mdxSource: string }) => (
      <div>{mdxSource}</div>
    ),
  }),
);

const baseProps = {
  questionTitle: "What is the difference between var, let, and const?",
  question: "Explain var, let and const.",
  answer: "They differ in scope and mutability.",
};

describe("InterviewQuestionContent credibility tags", () => {
  it("renders priority, frequency, difficulty, role and company tags with icons", () => {
    const { container } = render(
      <InterviewQuestionContent
        {...baseProps}
        priority="Medium"
        frequency="Asked Frequently"
        difficulty="Easy"
        role="Frontend"
        companyTypes={["Startup", "FAANG"]}
      />,
    );

    expect(screen.getByText(/Medium Priority/)).toBeInTheDocument();
    expect(screen.getByText("Asked Frequently")).toBeInTheDocument();
    expect(screen.getByText("Easy")).toBeInTheDocument();
    expect(screen.getByText(/Frontend Role/)).toBeInTheDocument();
    expect(screen.getByText(/Asked at Startup · FAANG/)).toBeInTheDocument();
    expect(container.querySelectorAll("svg").length).toBeGreaterThanOrEqual(5);
  });

  it("explains where the credibility data comes from via tooltips", () => {
    render(
      <InterviewQuestionContent
        {...baseProps}
        frequency="Most Asked"
        companyTypes={["MNC"]}
      />,
    );

    expect(screen.getByText("Most Asked")).toHaveAttribute(
      "title",
      "How often this question shows up in reported interviews",
    );
    expect(screen.getByText(/Asked at MNC/)).toHaveAttribute(
      "title",
      "Reported in interviews at MNC",
    );
  });

  it("hides the credibility row when no metadata is available", () => {
    render(<InterviewQuestionContent {...baseProps} />);

    expect(screen.queryByText(/Priority/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Asked at/)).not.toBeInTheDocument();
  });
});
