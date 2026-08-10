import {
  AptitudeQuestionCard,
  AptitudeQuizPanel,
  sanitizeHTML,
} from "@tbe/components";
import type { AptitudeQuestion } from "@tbe/interface";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const questionWithMaliciousHtml: AptitudeQuestion = {
  _id: "q-1",
  question: `<img src="x" onerror="alert('xss')"><script>alert('xss')</script>Safe question`,
  answer: `<a href="javascript:alert('xss')">details</a> <script>alert('xss')</script>Safe answer`,
  options: [
    {
      text: `<img src="x" onerror="alert('xss')">Safe option`,
      isCorrect: true,
    },
  ],
  isCompleted: false,
};

describe("HTML sanitization", () => {
  it("strips script tags, event handlers, and javascript links", () => {
    const dirty =
      `<script>alert('xss')</script>` +
      `<img src="x" onerror="alert('xss')">` +
      `<a href="javascript:alert('xss')">malicious</a>`;

    const clean = sanitizeHTML(dirty);

    expect(clean).not.toContain("<script");
    expect(clean).not.toContain("onerror");
    expect(clean).not.toContain("javascript:");
  });

  it("sanitizes rendered aptitude question/option/explanation HTML", () => {
    const { container } = render(
      <div>
        <AptitudeQuestionCard
          question={questionWithMaliciousHtml}
          index={0}
          totalQuestions={1}
          onNext={vi.fn()}
          onPrev={vi.fn()}
        />
        <AptitudeQuizPanel questions={[questionWithMaliciousHtml]} />
      </div>,
    );

    fireEvent.click(screen.getByRole("button", { name: "View Explanation" }));

    expect(container.querySelector("script")).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain("onerror");
    expect(container.innerHTML).not.toContain('href="javascript:');
  });
});
