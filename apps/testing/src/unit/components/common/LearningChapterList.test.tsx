import { LearningChapterList } from "@tbe/components";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
    onClick,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
  }) => (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        onClick?.(e);
        e.preventDefault();
      }}
      {...rest}
    >
      {children}
    </a>
  ),
}));

const chapters = [
  { _id: "ch-1", name: "Intro", content: "mdx-1", isCompleted: true },
  { _id: "ch-2", name: "Arrays", content: "mdx-2", isCompleted: false },
] as any;

describe("LearningChapterList", () => {
  it("renders a shared destination for every chapter", () => {
    render(
      <LearningChapterList
        chapters={chapters}
        currentChapterId="ch-1"
        href="/shiksha/course/learn"
        onChapterSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole("link", { name: "1. Intro" })).toHaveAttribute(
      "href",
      "/shiksha/course/learn",
    );
    expect(screen.getByRole("link", { name: "2. Arrays" })).toHaveAttribute(
      "href",
      "/shiksha/course/learn",
    );
  });

  it("renders a per-chapter destination when href is a resolver", () => {
    render(
      <LearningChapterList
        chapters={chapters}
        currentChapterId="ch-1"
        href={({ _id }) => `/shiksha/course/learn?chapterId=${_id}`}
        onChapterSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole("link", { name: "1. Intro" })).toHaveAttribute(
      "href",
      "/shiksha/course/learn?chapterId=ch-1",
    );
    expect(screen.getByRole("link", { name: "2. Arrays" })).toHaveAttribute(
      "href",
      "/shiksha/course/learn?chapterId=ch-2",
    );
  });
});
