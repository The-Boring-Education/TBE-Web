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
  id: "64a000000000000000000001",
  name: "Nitin Verma",
  email: "nitin@dsayatra.com",
};

const mockProfile = {
  linkedInUrl: "https://linkedin.com/in/nitin",
  githubUrl: "https://github.com/nitin",
  leetCodeUrl: "https://leetcode.com/nitin",
  dsaYatra: {
    target: "Product-based",
    timeline: "4 - 6 months",
    experienceLevel: "Tech student",
    companies: ["Google", "Amazon"],
  },
};

const mocks = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  useCompletedMock: vi.fn(),
  useQuestionsMock: vi.fn(),
  userServiceMock: {
    getProfile: vi.fn(),
  },
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
  ProtectedRoute: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@tbe/hooks", () => ({
  useDsaCompletedQuestions: () => mocks.useCompletedMock(),
  useDsaQuestions: () => mocks.useQuestionsMock(),
}));

vi.mock("@tbe/services", () => ({
  userService: mocks.userServiceMock,
}));

vi.mock("@tbe/components", () => ({
  SEO: () => null,
  EditDsaOnboardingModal: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid="edit-dsa-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}));

vi.mock("@tbe/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
  getPreFetchProps: vi.fn(),
}));

import Dashboard from "../../../../dsayatra/src/pages/dashboard";

describe("DSA Yatra Dashboard Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAuthMock.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    });
    mocks.useCompletedMock.mockReturnValue({
      completedIds: ["64a000000000000000000010", "64a000000000000000000011"],
      solvedToday: 2,
    });
    mocks.useQuestionsMock.mockReturnValue({
      questions: [
        {
          _id: "64a000000000000000000010",
          name: "Two Sum",
          difficultyLevel: "EASY",
        },
        {
          _id: "64a000000000000000000011",
          name: "Add Two Numbers",
          difficultyLevel: "MEDIUM",
        },
      ],
    });
    mocks.userServiceMock.getProfile.mockResolvedValue(mockProfile);
  });

  describe("Rendering", () => {
    it("renders welcome banner with user name", async () => {
      render(
        <Dashboard
          slug="/dashboard"
          seoMeta={{
            title: "",
            siteName: "",
            description: "",
            url: "",
            type: "",
            robots: "",
            image: "",
            keywords: "",
            author: "",
            publisher: "",
            linkedIn: "",
            instagram: "",
            github: "",
          }}
        />,
      );

      expect(screen.getByText(/welcome back, Nitin!/i)).toBeInTheDocument();
      expect(
        screen.getByText("Consistency today, better opportunities tomorrow."),
      ).toBeInTheDocument();
    });

    it("renders overall progress and stats", () => {
      render(
        <Dashboard
          slug="/dashboard"
          seoMeta={{
            title: "",
            siteName: "",
            description: "",
            url: "",
            type: "",
            robots: "",
            image: "",
            keywords: "",
            author: "",
            publisher: "",
            linkedIn: "",
            instagram: "",
            github: "",
          }}
        />,
      );

      expect(screen.getByText("Overall Progress")).toBeInTheDocument();
      expect(screen.getByText("Today's Activity")).toBeInTheDocument();
      expect(screen.getByText("Total Solved")).toBeInTheDocument();
    });
  });

  describe("Buttons and Interaction", () => {
    it("opens the Edit Goal modal when 'Edit Goal' button is clicked", () => {
      render(
        <Dashboard
          slug="/dashboard"
          seoMeta={{
            title: "",
            siteName: "",
            description: "",
            url: "",
            type: "",
            robots: "",
            image: "",
            keywords: "",
            author: "",
            publisher: "",
            linkedIn: "",
            instagram: "",
            github: "",
          }}
        />,
      );

      expect(screen.queryByTestId("edit-dsa-modal")).not.toBeInTheDocument();

      const editGoalBtn = screen.getByRole("button", { name: /edit goal/i });
      fireEvent.click(editGoalBtn);

      expect(screen.getByTestId("edit-dsa-modal")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /close modal/i }));
      expect(screen.queryByTestId("edit-dsa-modal")).not.toBeInTheDocument();
    });

    it("navigates to /sheets when 'Start Solving' button is clicked", () => {
      render(
        <Dashboard
          slug="/dashboard"
          seoMeta={{
            title: "",
            siteName: "",
            description: "",
            url: "",
            type: "",
            robots: "",
            image: "",
            keywords: "",
            author: "",
            publisher: "",
            linkedIn: "",
            instagram: "",
            github: "",
          }}
        />,
      );

      const startSolvingBtn = screen.getByRole("button", {
        name: /start solving/i,
      });
      fireEvent.click(startSolvingBtn);

      expect(mockRouter.push).toHaveBeenCalledWith("/sheets");
    });

    it("renders recommended action links to sheets and revisions", () => {
      render(
        <Dashboard
          slug="/dashboard"
          seoMeta={{
            title: "",
            siteName: "",
            description: "",
            url: "",
            type: "",
            robots: "",
            image: "",
            keywords: "",
            author: "",
            publisher: "",
            linkedIn: "",
            instagram: "",
            github: "",
          }}
        />,
      );

      const continueSolvingLink = screen.getByRole("link", {
        name: /continue solving/i,
      });
      expect(continueSolvingLink).toBeInTheDocument();
      expect(continueSolvingLink).toHaveAttribute("href", "/sheets");

      const exploreSheetsLink = screen.getByRole("link", {
        name: /explore sheets/i,
      });
      expect(exploreSheetsLink).toBeInTheDocument();
      expect(exploreSheetsLink).toHaveAttribute("href", "/sheets");

      const reviseMistakesLink = screen.getByRole("link", {
        name: /revise mistakes/i,
      });
      expect(reviseMistakesLink).toBeInTheDocument();
      expect(reviseMistakesLink).toHaveAttribute("href", "/revisions");
    });
  });
});
