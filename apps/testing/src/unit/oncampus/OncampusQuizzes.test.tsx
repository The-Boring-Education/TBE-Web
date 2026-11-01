import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRouter = {
  push: vi.fn(),
  pathname: "/dashboard/quizzes",
  asPath: "/dashboard/quizzes",
  query: {} as Record<string, string>,
};

const mockUser = {
  id: "user-oncampus-123",
  name: "Nitin Verma",
};

const mockCategories = [
  {
    _id: "quiz-cat-1",
    categoryName: "JavaScript Basics",
    quizzesCount: 10,
  },
  {
    _id: "quiz-cat-2",
    categoryName: "React Mastery",
    quizzesCount: 15,
  },
];

const mocks = vi.hoisted(() => ({
  useUserMock: vi.fn(),
  useAuthMock: vi.fn(),
  useQuizDataMock: vi.fn(),
}));

vi.mock("next/router", () => ({
  useRouter: () => mockRouter,
}));

vi.mock("next/head", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: ReactNode;
    className?: string;
  }) => (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        mockRouter.push(href);
      }}
    >
      {children}
    </a>
  ),
}));

vi.mock("@tbe/auth", () => ({
  useAuth: () => mocks.useAuthMock(),
}));

vi.mock("@tbe/hooks", () => ({
  useUser: () => mocks.useUserMock(),
  useQuizData: () => mocks.useQuizDataMock(),
}));

vi.mock("@tbe/components", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
  ContentFeedbackWidget: () => null,
  QuizCatalogSpace: ({ categories, onSelectQuiz }: any) => (
    <div data-testid="quiz-catalog-space">
      {categories.map((cat: any) => (
        <button
          key={cat._id}
          onClick={() => onSelectQuiz(cat._id, cat.categoryName)}
        >
          {cat.categoryName}
        </button>
      ))}
    </div>
  ),
  QuizPlaySpace: ({ quizId, quizName, onBack }: any) => (
    <div data-testid="quiz-play-space">
      <h2>Playing: {quizName || quizId}</h2>
      <button onClick={onBack}>Back to Catalog</button>
    </div>
  ),
}));

import QuizzesDashboardPage from "../../../../oncampus/src/pages/dashboard/quizzes";

describe("OnCampus Quizzes Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter.query = {};

    mocks.useUserMock.mockReturnValue({
      user: mockUser,
      loading: false,
    });

    mocks.useAuthMock.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    mocks.useQuizDataMock.mockReturnValue({
      categories: mockCategories,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it("renders quiz catalog and breadcrumbs", () => {
    render(<QuizzesDashboardPage />);

    expect(screen.getByText("OnCampus")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Quizzes" })).toBeInTheDocument();
    expect(screen.getByTestId("quiz-catalog-space")).toBeInTheDocument();
    expect(screen.getByText("JavaScript Basics")).toBeInTheDocument();
    expect(screen.getByText("React Mastery")).toBeInTheDocument();
  });

  it("selects a quiz and transitions into QuizPlaySpace", () => {
    render(<QuizzesDashboardPage />);

    const jsBtn = screen.getByRole("button", { name: "JavaScript Basics" });
    fireEvent.click(jsBtn);

    expect(mockRouter.push).toHaveBeenCalledWith(
      {
        pathname: "/dashboard/quizzes",
        query: { quizId: "quiz-cat-1" },
      },
      undefined,
      { shallow: true },
    );
  });

  it("renders QuizPlaySpace when query has quizId", () => {
    mockRouter.query = { quizId: "quiz-cat-2" };

    render(<QuizzesDashboardPage />);

    expect(screen.getByTestId("quiz-play-space")).toBeInTheDocument();
    expect(screen.getByText(/Playing: React Mastery/i)).toBeInTheDocument();

    const backBtn = screen.getByRole("button", { name: /back to catalog/i });
    fireEvent.click(backBtn);

    expect(mockRouter.push).toHaveBeenCalledWith(
      "/dashboard/quizzes",
      undefined,
      { shallow: true },
    );
  });
});
