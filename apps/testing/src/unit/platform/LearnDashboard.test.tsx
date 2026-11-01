import { LearnDashboardContainer } from "@tbe/components";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  pathname: "/learn",
  asPath: "/learn",
  query: {},
  isReady: true,
};

const mockUser = {
  id: "user-platform-123",
  name: "Nitin Verma",
  email: "nitin@theboringeducation.com",
  points: 150,
};

const mocks = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  useGamificationMock: vi.fn(),
  quizApiMock: {
    getCategories: vi.fn(),
  },
  sendRequestMock: vi.fn(),
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

vi.mock("@tbe/auth", () => ({
  useAuth: () => mocks.useAuthMock(),
}));

vi.mock("@tbe/gamification", () => ({
  useGamification: () => mocks.useGamificationMock(),
}));

vi.mock("@tbe/services", () => ({
  quizApi: mocks.quizApiMock,
}));

vi.mock("@tbe/utils", () => ({
  sendRequest: (args: any) => mocks.sendRequestMock(args),
}));

vi.mock("@tbe/components/learn/CourseLearningSpace", () => ({
  CourseLearningSpace: ({ onBack }: any) => (
    <div data-testid="course-learning-space">
      <button onClick={onBack}>Back from Course</button>
    </div>
  ),
  prefetchCourseData: vi.fn(),
}));

vi.mock("@tbe/components/learn/SheetLearningSpace", () => ({
  SheetLearningSpace: ({ onBack }: any) => (
    <div data-testid="sheet-learning-space">
      <button onClick={onBack}>Back from Sheet</button>
    </div>
  ),
  prefetchSheetData: vi.fn(),
}));

vi.mock("@tbe/components/learn/QuizCatalogSpace", () => ({
  QuizCatalogSpace: ({ onSelectQuiz }: any) => (
    <div data-testid="quiz-catalog-space">
      <button onClick={() => onSelectQuiz("quiz-1", "React Quiz")}>
        Select Quiz
      </button>
    </div>
  ),
  prefetchQuizData: vi.fn(),
}));

vi.mock("@tbe/components/learn/QuizPlaySpace", () => ({
  QuizPlaySpace: ({ onBack }: any) => (
    <div data-testid="quiz-play-space">
      <button onClick={onBack}>Back from Quiz</button>
    </div>
  ),
}));

describe("LearnDashboardContainer Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter.asPath = "/learn";

    mocks.useAuthMock.mockReturnValue({
      user: mockUser,
      signOut: vi.fn(),
    });

    mocks.useGamificationMock.mockReturnValue({
      points: 150,
    });

    mocks.quizApiMock.getCategories.mockResolvedValue({
      status: true,
      data: [
        { _id: "quiz-1", categoryName: "JavaScript Mastery" },
        { _id: "quiz-2", categoryName: "React Mastery" },
      ],
    });

    mocks.sendRequestMock.mockImplementation((args: any) => {
      if (args.url?.includes("/shiksha")) {
        return Promise.resolve({
          status: true,
          data: [
            {
              _id: "course-1",
              name: "Zero to One Frontend",
              slug: "zero-to-one-frontend",
              status: "PUBLISHED",
              chapters: [{ _id: "ch-1", name: "Intro" }],
            },
          ],
        });
      }
      if (
        args.url?.includes("/user/shiksha") ||
        args.url?.includes("/user/interview-prep")
      ) {
        return Promise.resolve({
          status: true,
          data: [
            {
              _id: "sheet-1",
              title: "React Interview Questions",
              slug: "react-interview-questions",
              progress: { completed: 3, total: 10, percentage: 30 },
            },
          ],
        });
      }
      if (args.url?.includes("/interview-prep")) {
        return Promise.resolve({
          status: true,
          data: [
            {
              _id: "sheet-1",
              name: "React Interview Questions",
              slug: "react-interview-questions",
              roadmap: "Frontend",
              questions: [{ _id: "q-1", name: "What is JSX?" }],
            },
          ],
        });
      }
      return Promise.resolve({ status: true, data: [] });
    });
  });

  describe("Header and Sidebar controls", () => {
    it("renders greeting with user name and points", async () => {
      render(<LearnDashboardContainer user={mockUser} />);

      await waitFor(() => {
        expect(screen.getAllByText(/Nitin/i).length).toBeGreaterThan(0);
      });
      expect(screen.getByText("150")).toBeInTheDocument();
    });

    it("toggles dark mode when theme button is clicked", async () => {
      render(<LearnDashboardContainer user={mockUser} />);

      const themeToggle = screen.getByTitle(/switch to dark mode/i);
      expect(themeToggle).toBeInTheDocument();

      fireEvent.click(themeToggle);
      expect(document.documentElement.classList.contains("dark")).toBe(true);

      const lightToggle = screen.getByTitle(/switch to light mode/i);
      fireEvent.click(lightToggle);
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("toggles sidebar collapse when collapse button is clicked", async () => {
      render(<LearnDashboardContainer user={mockUser} />);

      const collapseBtn = screen.getByTitle(/collapse sidebar/i);
      expect(collapseBtn).toBeInTheDocument();

      fireEvent.click(collapseBtn);
      expect(screen.getByTitle(/expand sidebar/i)).toBeInTheDocument();
    });
  });

  describe("Sidebar Navigation Tabs", () => {
    it("navigates to Shiksha tab when Shiksha is clicked", async () => {
      render(<LearnDashboardContainer user={mockUser} />);

      const shikshaBtn = screen.getByRole("button", { name: "Shiksha" });
      fireEvent.click(shikshaBtn);

      expect(mockRouter.push).toHaveBeenCalledWith(
        "/learn/shiksha",
        undefined,
        { shallow: true },
      );
    });

    it("navigates to Interview Prep tab when Interview Prep is clicked", async () => {
      render(<LearnDashboardContainer user={mockUser} />);

      const interviewPrepBtn = screen.getByRole("button", {
        name: "Interview Prep",
      });
      fireEvent.click(interviewPrepBtn);

      expect(mockRouter.push).toHaveBeenCalledWith(
        "/learn/interview-prep",
        undefined,
        { shallow: true },
      );
    });

    it("navigates to Ecosystem tab when Ecosystem is clicked", async () => {
      render(<LearnDashboardContainer user={mockUser} />);

      const ecosystemBtn = screen.getByRole("button", { name: "Ecosystem" });
      fireEvent.click(ecosystemBtn);

      expect(mockRouter.push).toHaveBeenCalledWith(
        "/learn/ecosystem",
        undefined,
        { shallow: true },
      );
    });

    it("navigates to Quizzes tab when Quizzes is clicked", async () => {
      render(<LearnDashboardContainer user={mockUser} />);

      const quizzesBtn = screen.getAllByRole("button", { name: /quizzes/i })[0];
      fireEvent.click(quizzesBtn);

      expect(mockRouter.push).toHaveBeenCalledWith(
        "/learn/quizzes",
        undefined,
        { shallow: true },
      );
    });
  });

  describe("Dashboard Tab Buttons and Actions", () => {
    it("tests 'Explore Catalog' button on bulb card", async () => {
      render(<LearnDashboardContainer user={mockUser} />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /explore catalog/i }),
        ).toBeInTheDocument();
      });

      const exploreCatalogBtn = screen.getByRole("button", {
        name: /explore catalog/i,
      });
      fireEvent.click(exploreCatalogBtn);

      // Verify whether Catalog (Explore) view is rendered
      expect(
        screen.getByText(/explore courses, sheets & resources/i),
      ).toBeInTheDocument();
    });

    it("tests 'Explore all courses & sheets' header button", async () => {
      render(<LearnDashboardContainer user={mockUser} />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", {
            name: /explore all courses & sheets/i,
          }),
        ).toBeInTheDocument();
      });

      const exploreAllBtn = screen.getByRole("button", {
        name: /explore all courses & sheets/i,
      });
      fireEvent.click(exploreAllBtn);

      expect(
        screen.getByText(/explore courses, sheets & resources/i),
      ).toBeInTheDocument();
    });

    it("tests 'Resume Sheet' button under My learning on the Dashboard", async () => {
      render(<LearnDashboardContainer user={mockUser} />);

      await waitFor(() => {
        expect(
          screen.getByText("React Interview Questions"),
        ).toBeInTheDocument();
      });

      const resumeSheetBtn = screen.getByRole("button", {
        name: /resume sheet/i,
      });
      expect(resumeSheetBtn).toBeInTheDocument();

      fireEvent.click(resumeSheetBtn);

      // When Resume Sheet is clicked, does it open the sheet space or navigate?
      // In SheetLearningSpace, test if sheet workspace opens
      await waitFor(() => {
        expect(
          screen.queryByTestId("sheet-learning-space") ||
            mockRouter.push.mock.calls.length > 0,
        ).toBeTruthy();
      });
    });

    it("tests 'Tech Quizzes' quick button under More features to explore", async () => {
      render(<LearnDashboardContainer user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByText("Tech Quizzes")).toBeInTheDocument();
      });

      const techQuizzesBtn = screen.getByRole("button", {
        name: /tech quizzes/i,
      });
      fireEvent.click(techQuizzesBtn);

      expect(mockRouter.push).toHaveBeenCalledWith(
        "/learn/quizzes",
        undefined,
        { shallow: true },
      );
    });
  });
});
