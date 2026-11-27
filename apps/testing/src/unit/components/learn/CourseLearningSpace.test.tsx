import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSendRequest = vi.fn();
vi.mock("@tbe/utils", async () => {
  const actual = await vi.importActual<any>("@tbe/utils");
  return {
    ...actual,
    sendRequest: (...args: any[]) => mockSendRequest(...args),
  };
});

vi.mock("@tbe/gamification", () => ({
  useGamificationFeedback: () => ({
    celebrate: vi.fn(),
  }),
}));

vi.mock("@tbe/components/common/MDXRenderer", () => ({
  __esModule: true,
  default: ({ mdxSource }: any) => (
    <div data-testid="mdx-renderer">{mdxSource}</div>
  ),
}));

import {
  courseDataCache,
  CourseLearningSpace,
} from "@tbe/components/learn/CourseLearningSpace";

describe("CourseLearningSpace - Typography & Readability", () => {
  const sampleCourse = {
    _id: "course-1",
    slug: "logic-building",
    name: "Logic Building for Everyone",
    description: "Build programming logic from scratch.",
    chapters: [
      {
        _id: "ch-1",
        name: "Variables and Data Types",
        content: "# Variables\nLearn how variables work.",
        isCompleted: false,
      },
      {
        _id: "ch-2",
        name: "Loops and Iteration",
        content: "Loops repeat work.",
        isCompleted: true,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    courseDataCache.clear();
    courseDataCache.set("logic-building", sampleCourse);
    mockSendRequest.mockResolvedValue({ status: true, data: sampleCourse });
  });

  it("renders active chapter heading with valid responsive md:text-[26px] class", () => {
    render(
      <CourseLearningSpace
        courseSlug="logic-building"
        initialCourse={sampleCourse}
        user={{ id: "u-1" }}
        onBack={vi.fn()}
      />,
    );

    const heading = screen.getByRole("heading", {
      level: 2,
      name: "Variables and Data Types",
    });
    expect(heading).toHaveClass("text-xl", "sm:text-2xl", "md:text-[26px]");
    expect(heading.className).not.toContain("md:[26px]");
  });

  it("renders sidebar chapter items with readable text-sm and leading-normal classes", () => {
    render(
      <CourseLearningSpace
        courseSlug="logic-building"
        initialCourse={sampleCourse}
        user={{ id: "u-1" }}
        onBack={vi.fn()}
      />,
    );

    const chapterLabel = screen.getByText("Loops and Iteration");
    expect(chapterLabel).toHaveClass("text-sm", "leading-normal");
  });

  it("renders chapter reader body with 15-16px baseline and relaxed line-height", () => {
    render(
      <CourseLearningSpace
        courseSlug="logic-building"
        initialCourse={sampleCourse}
        user={{ id: "u-1" }}
        onBack={vi.fn()}
      />,
    );

    const mdx = screen.getByTestId("mdx-renderer");
    expect(mdx.parentElement).toHaveClass(
      "text-[15px]",
      "sm:text-base",
      "leading-relaxed",
    );
  });
});
