import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  pathname: "/interview-sheets",
  asPath: "/interview-sheets",
  query: {} as Record<string, string>,
};

const mockUser = {
  id: "user-oncampus-123",
  name: "Nitin Verma",
};

const mockSheets = [
  {
    _id: "sheet-1",
    name: "JavaScript Interview Questions",
    slug: "javascript-interview-questions",
    roadmap: "Tech",
    description: "Core JS concepts",
    isPremium: false,
    questions: [{ _id: "q-1", title: "Closures" }],
  },
  {
    _id: "sheet-2",
    name: "Database SQL Interview",
    slug: "database-sql-interview",
    roadmap: "Database",
    description: "SQL queries",
    isPremium: true,
    questions: [{ _id: "q-2", title: "Joins" }],
  },
];

const mocks = vi.hoisted(() => ({
  useUserMock: vi.fn(),
  useQueryMock: vi.fn(),
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

vi.mock("@tbe/hooks", () => ({
  useUser: () => mocks.useUserMock(),
}));

vi.mock("@tbe/query", () => ({
  useQuery: (options: any) => mocks.useQueryMock(options),
  queryKeys: {
    interviewPrep: {
      list: (args: any) => ["interviewPrep", "list", args],
      lists: () => ["interviewPrep", "lists"],
    },
  },
  CACHE_TIMES: {
    STATIC: {},
    STANDARD: {},
  },
}));

vi.mock("@tbe/components", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
  prefetchSheetData: vi.fn(),
  SEO: () => null,
  SheetLearningSpace: ({ onBack, onNavigateToDashboard }: any) => (
    <div data-testid="sheet-learning-space">
      <button onClick={onBack}>Back to Catalog</button>
      <button onClick={onNavigateToDashboard}>Go Dashboard</button>
    </div>
  ),
}));

vi.mock("@tbe/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
  getSheetPageProps: vi.fn(),
  isUserAuthenticated: vi.fn(),
  mapInterviewSheetResponseToCard: (sheets: any[]) =>
    sheets.map((s) => ({
      _id: s._id,
      title: s.name,
      description: s.description,
      slug: s.slug,
      isPremium: s.isPremium,
    })),
  sendRequest: vi.fn(),
}));

import InterviewPrepDashboardPage from "../../../../oncampus/src/pages/interview-sheets/index";

describe("OnCampus Interview Sheets Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter.query = {};

    mocks.useUserMock.mockReturnValue({
      user: mockUser,
      loading: false,
      isAuth: true,
    });

    mocks.useQueryMock.mockImplementation((options: any) => {
      const key = options.queryKey;
      if (key[0] === "interviewPrep" && key[1] === "list") {
        return { data: { status: true, data: mockSheets }, isLoading: false };
      }
      if (key[0] === "interviewPrep" && key[1] === "lists") {
        return { data: { status: true, data: [] }, isLoading: false };
      }
      return { data: null, isLoading: false };
    });
  });

  describe("Catalog Rendering & Roadmap Filters", () => {
    it("renders page title and available sheets count", () => {
      render(<InterviewPrepDashboardPage slug="" />);
      expect(screen.getByText("Crack Tech Interviews")).toBeInTheDocument();
      expect(screen.getByText(/2 sheets available/i)).toBeInTheDocument();
    });

    it("renders roadmap filter pills and handles click", () => {
      render(<InterviewPrepDashboardPage slug="" />);

      const allSheetsBtn = screen.getByRole("button", {
        name: /all sheets/i,
      });
      expect(allSheetsBtn).toBeInTheDocument();

      const dbBtn = screen.getByRole("button", { name: /database/i });
      expect(dbBtn).toBeInTheDocument();

      fireEvent.click(dbBtn);
      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: "/interview-sheets",
        query: { roadmap: "database" },
      });
    });

    it("filters sheets when typing in search input and clears search on X click", () => {
      render(<InterviewPrepDashboardPage slug="" />);

      const searchInput = screen.getByPlaceholderText(/search sheet title.../i);
      fireEvent.change(searchInput, { target: { value: "Database" } });

      expect(screen.getByText("Database SQL Interview")).toBeInTheDocument();
      expect(
        screen.queryByText("JavaScript Interview Questions"),
      ).not.toBeInTheDocument();

      // Clear button
      const clearBtn = screen.getByRole("button", { name: "" });
      fireEvent.click(clearBtn);
      expect(
        screen.getByText("JavaScript Interview Questions"),
      ).toBeInTheDocument();
    });
  });

  describe("Sheet Card Action Button", () => {
    it("navigates to sheet topic view when 'Start Learning' is clicked", () => {
      render(<InterviewPrepDashboardPage slug="" />);

      const startBtns = screen.getAllByRole("button", {
        name: /start learning/i,
      });
      expect(startBtns.length).toBeGreaterThan(0);

      fireEvent.click(startBtns[0]);
      expect(mockRouter.push).toHaveBeenCalledWith(
        "/interview-sheets?topic=javascript-interview-questions",
      );
    });

    it("renders SheetLearningSpace when query.topic is present", () => {
      mockRouter.query = { topic: "javascript-interview-questions" };

      render(
        <InterviewPrepDashboardPage slug="" sheet={mockSheets[0] as any} />,
      );

      expect(screen.getByTestId("sheet-learning-space")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /back to catalog/i }));
      expect(mockRouter.push).toHaveBeenCalledWith("/interview-sheets");
    });
  });
});
