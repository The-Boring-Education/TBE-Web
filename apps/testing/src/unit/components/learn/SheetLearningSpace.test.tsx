import { routes } from "@tbe/constants";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  sheetDataCache,
  SheetLearningSpace,
} from "@tbe/components/learn/SheetLearningSpace";

describe("SheetLearningSpace - Question Save Button", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
  };

  const getSampleSheet = () => ({
    _id: "sheet-abc",
    slug: "javascript-basics",
    name: "JavaScript Basics",
    questions: [
      {
        _id: "q-1",
        title: "What is closure?",
        question: "What is closure in JS?",
        answer: "A closure is...",
        isCompleted: false,
        isStarred: false,
      },
      {
        _id: "q-2",
        title: "Explain event loop",
        question: "Explain event loop in Node.js",
        answer: "Event loop manages...",
        isCompleted: true,
        isStarred: true,
      },
    ],
  });

  beforeEach(() => {
    vi.clearAllMocks();
    sheetDataCache.clear();
    const sheet = getSampleSheet();
    sheetDataCache.set("javascript-basics", sheet);
    mockSendRequest.mockResolvedValue({ status: true, data: sheet });
  });

  it("renders 'Save' button when current question is not starred", () => {
    const sheet = getSampleSheet();
    render(
      <SheetLearningSpace
        sheetSlug="javascript-basics"
        initialSheet={sheet}
        user={mockUser}
        onBack={vi.fn()}
      />,
    );

    const saveButton = screen.getByRole("button", { name: /^save$/i });
    expect(saveButton).toBeInTheDocument();
  });

  it("renders 'Saved' button when current question is starred", () => {
    const sheet = getSampleSheet();
    sheet.questions[0].isStarred = true;
    sheetDataCache.set("javascript-basics", sheet);

    render(
      <SheetLearningSpace
        sheetSlug="javascript-basics"
        initialSheet={sheet}
        user={mockUser}
        onBack={vi.fn()}
      />,
    );

    const savedButton = screen.getByRole("button", { name: /^saved$/i });
    expect(savedButton).toBeInTheDocument();
  });

  it("optimistically toggles to 'Saved' and calls markSheetQuestionAsStarred API", async () => {
    const sheet = getSampleSheet();
    mockSendRequest.mockResolvedValueOnce({ status: true });

    render(
      <SheetLearningSpace
        sheetSlug="javascript-basics"
        initialSheet={sheet}
        user={mockUser}
        onBack={vi.fn()}
      />,
    );

    const saveButton = screen.getByRole("button", { name: /^save$/i });
    fireEvent.click(saveButton);

    // Optimistic update to 'Saved'
    expect(
      screen.getByRole("button", { name: /^saved$/i }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(mockSendRequest).toHaveBeenCalledWith({
        method: "POST",
        url: routes.api.markSheetQuestionAsStarred,
        body: {
          userId: "user-123",
          sheetId: "sheet-abc",
          questionId: "q-1",
          isStarred: true,
        },
      });
    });
  });

  it("toggles from 'Saved' to 'Save' when clicked on an already saved question", async () => {
    const sheet = getSampleSheet();
    sheet.questions[0].isStarred = true;
    sheetDataCache.set("javascript-basics", sheet);
    mockSendRequest.mockResolvedValueOnce({ status: true });

    render(
      <SheetLearningSpace
        sheetSlug="javascript-basics"
        initialSheet={sheet}
        user={mockUser}
        onBack={vi.fn()}
      />,
    );

    const savedButton = screen.getByRole("button", { name: /^saved$/i });
    fireEvent.click(savedButton);

    // Optimistically changes to 'Save'
    expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockSendRequest).toHaveBeenCalledWith({
        method: "POST",
        url: routes.api.markSheetQuestionAsStarred,
        body: {
          userId: "user-123",
          sheetId: "sheet-abc",
          questionId: "q-1",
          isStarred: false,
        },
      });
    });
  });

  it("reverts back to 'Save' if the API call returns failure (status: false)", async () => {
    const sheet = getSampleSheet();
    mockSendRequest.mockImplementation((req: any) => {
      if (req?.url === routes.api.markSheetQuestionAsStarred) {
        return Promise.resolve({ status: false });
      }
      return Promise.resolve({ status: true, data: sheet });
    });

    render(
      <SheetLearningSpace
        sheetSlug="javascript-basics"
        initialSheet={sheet}
        user={mockUser}
        onBack={vi.fn()}
      />,
    );

    const saveButton = screen.getByRole("button", { name: /^save$/i });
    fireEvent.click(saveButton);

    // First changes optimistically
    expect(
      screen.getByRole("button", { name: /^saved$/i }),
    ).toBeInTheDocument();

    // Reverts after failed response
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /^save$/i }),
      ).toBeInTheDocument();
    });
  });

  it("reverts back to 'Save' if the API call throws an error", async () => {
    const sheet = getSampleSheet();
    mockSendRequest.mockImplementation((req: any) => {
      if (req?.url === routes.api.markSheetQuestionAsStarred) {
        return Promise.reject(new Error("Network failure"));
      }
      return Promise.resolve({ status: true, data: sheet });
    });

    render(
      <SheetLearningSpace
        sheetSlug="javascript-basics"
        initialSheet={sheet}
        user={mockUser}
        onBack={vi.fn()}
      />,
    );

    const saveButton = screen.getByRole("button", { name: /^save$/i });
    fireEvent.click(saveButton);

    expect(
      screen.getByRole("button", { name: /^saved$/i }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /^save$/i }),
      ).toBeInTheDocument();
    });
  });

  it("does not call API if user is not authenticated", async () => {
    const sheet = getSampleSheet();
    render(
      <SheetLearningSpace
        sheetSlug="javascript-basics"
        initialSheet={sheet}
        user={null}
        onBack={vi.fn()}
      />,
    );

    const saveButton = screen.getByRole("button", { name: /^save$/i });
    fireEvent.click(saveButton);

    expect(mockSendRequest).not.toHaveBeenCalledWith(
      expect.objectContaining({
        url: routes.api.markSheetQuestionAsStarred,
      }),
    );
    expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
  });
});
