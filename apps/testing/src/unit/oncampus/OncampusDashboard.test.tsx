import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  pathname: "/dashboard",
  asPath: "/dashboard",
  query: {},
};

const mockUser = {
  id: "user-oncampus-123",
  name: "Nitin Verma",
  email: "nitin@example.com",
};

const mocks = vi.hoisted(() => ({
  useUserMock: vi.fn(),
  useQueryMock: vi.fn(),
}));

vi.mock("next/router", () => ({
  useRouter: () => mockRouter,
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
      lists: () => ["interviewPrep", "lists"],
    },
    quiz: {
      performance: (id: string) => ["quiz", "performance", id],
    },
  },
  CACHE_TIMES: {
    STANDARD: {},
  },
}));

vi.mock("@tbe/components", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

vi.mock("@tbe/utils", () => ({
  sendRequest: vi.fn(),
}));

import CampusPrepDashboard from "../../../../oncampus/src/pages/dashboard";

describe("OnCampus Dashboard Page (CampusPrepDashboard)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useUserMock.mockReturnValue({
      user: mockUser,
      loading: false,
      isAuth: true,
    });
  });

  describe("Loading and Auth states", () => {
    it("renders loading spinner when auth is loading", () => {
      mocks.useUserMock.mockReturnValue({
        user: null,
        loading: true,
        isAuth: false,
      });
      mocks.useQueryMock.mockReturnValue({ data: null, isLoading: true });

      render(<CampusPrepDashboard />);
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    it("renders nothing when user is not authenticated", () => {
      mocks.useUserMock.mockReturnValue({
        user: null,
        loading: false,
        isAuth: false,
      });
      mocks.useQueryMock.mockReturnValue({ data: null, isLoading: false });

      const { container } = render(<CampusPrepDashboard />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("Rendering Dashboard content", () => {
    it("renders welcome heading with user's name", () => {
      mocks.useQueryMock.mockReturnValue({ data: null, isLoading: false });

      render(<CampusPrepDashboard />);
      expect(screen.getByText(/welcome back,/i)).toBeInTheDocument();
      expect(screen.getByText("Nitin Verma")).toBeInTheDocument();
    });

    it("renders empty state for Recent Sheets with browse link", () => {
      mocks.useQueryMock.mockImplementation((options: any) => {
        if (options.queryKey[0] === "interviewPrep") {
          return { data: { status: true, data: [] }, isLoading: false };
        }
        return { data: null, isLoading: false };
      });

      render(<CampusPrepDashboard />);
      const browseLink = screen.getByRole("link", {
        name: /browse interview sheets →/i,
      });
      expect(browseLink).toBeInTheDocument();
      expect(browseLink).toHaveAttribute("href", "/interview-sheets");
    });

    it("renders enrolled sheets and tests 'Resume' button click", () => {
      mocks.useQueryMock.mockImplementation((options: any) => {
        if (options.queryKey[0] === "interviewPrep") {
          return {
            data: {
              status: true,
              data: [
                {
                  _id: "sheet-1",
                  name: "Frontend Interview Sheet",
                  slug: "frontend-interview-sheet",
                  progress: { completed: 5, total: 20, percentage: 25 },
                },
              ],
            },
            isLoading: false,
          };
        }
        return { data: null, isLoading: false };
      });

      render(<CampusPrepDashboard />);
      expect(screen.getByText("Frontend Interview Sheet")).toBeInTheDocument();
      expect(screen.getByText("25%")).toBeInTheDocument();

      const resumeBtn = screen.getByRole("button", { name: /resume/i });
      expect(resumeBtn).toBeInTheDocument();
      fireEvent.click(resumeBtn);

      expect(mockRouter.push).toHaveBeenCalledWith(
        "/interview-sheets?topic=frontend-interview-sheet",
      );
    });

    it("renders empty state for Quizzes with start quiz link", () => {
      mocks.useQueryMock.mockReturnValue({ data: null, isLoading: false });

      render(<CampusPrepDashboard />);
      const startQuizLink = screen.getByRole("link", {
        name: /start your first quiz →/i,
      });
      expect(startQuizLink).toBeInTheDocument();
      expect(startQuizLink).toHaveAttribute("href", "/dashboard/quizzes");
    });
  });

  describe("Practice Modules Button Navigation", () => {
    it("navigates to quizzes when 'Explore →' button is clicked", () => {
      mocks.useQueryMock.mockReturnValue({ data: null, isLoading: false });

      render(<CampusPrepDashboard />);
      const exploreBtn = screen.getByRole("button", { name: /explore →/i });
      expect(exploreBtn).toBeInTheDocument();

      fireEvent.click(exploreBtn);
      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/quizzes");
    });

    it("navigates to interview sheets when 'Open →' button is clicked", () => {
      mocks.useQueryMock.mockReturnValue({ data: null, isLoading: false });

      render(<CampusPrepDashboard />);
      const openBtn = screen.getByRole("button", { name: /open →/i });
      expect(openBtn).toBeInTheDocument();

      fireEvent.click(openBtn);
      expect(mockRouter.push).toHaveBeenCalledWith("/interview-sheets");
    });
  });
});
