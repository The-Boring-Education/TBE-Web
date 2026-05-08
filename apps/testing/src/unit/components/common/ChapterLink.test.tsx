import { ChapterLink } from "@tbe/components";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockTrackEvent = vi.fn();
vi.mock("@tbe/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tbe/utils")>();
  return {
    ...actual,
    trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
  };
});

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
        // JSDOM schedules full navigation for non-hash hrefs; tests only need handler + analytics.
        e.preventDefault();
      }}
      {...rest}
    >
      {children}
    </a>
  ),
}));

describe("ChapterLink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseProps = {
    href: "#course-ch-1",
    chapterId: "ch-1",
    name: "Intro",
    content: "mdx",
    isCompleted: false,
    currentChapterId: "ch-2",
    handleChapterClick: vi.fn(),
  };

  it("renders chapter name and navigates when unlocked", async () => {
    const user = userEvent.setup();
    render(<ChapterLink {...baseProps} isLocked={false} />);
    expect(screen.getByText("Intro")).toBeInTheDocument();

    const anchor = screen.getByRole("link", { name: "Intro" });
    expect(anchor).toHaveAttribute("data-tbe-analytics-skip-global");
    expect(anchor).toHaveAttribute(
      "data-tbe-analytics-id",
      `course_chapter_${baseProps.chapterId}`,
    );
    await user.click(anchor);
    expect(baseProps.handleChapterClick).toHaveBeenCalledWith("mdx", "ch-1");
    expect(mockTrackEvent).toHaveBeenCalledWith(
      "COURSE_CHAPTER_START",
      expect.objectContaining({
        category: "Course",
        label: "Intro",
        chapterId: "ch-1",
      }),
    );
  });

  it("prevents navigation and skips handler when locked", async () => {
    const user = userEvent.setup();
    render(<ChapterLink {...baseProps} isLocked />);
    await user.click(screen.getByRole("link", { name: "Intro" }));
    expect(baseProps.handleChapterClick).not.toHaveBeenCalled();
    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it("shows check icon styling when this chapter is current and completed", () => {
    const { container } = render(
      <ChapterLink
        {...baseProps}
        currentChapterId="ch-1"
        isCompleted
        isLocked={false}
      />,
    );
    const link = screen.getByText("Intro").closest("a");
    expect(link?.className).toContain("bg-green-200");
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
