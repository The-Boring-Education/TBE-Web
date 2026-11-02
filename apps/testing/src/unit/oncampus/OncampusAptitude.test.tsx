import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRouter = {
  push: vi.fn(),
  pathname: "/aptitude",
  asPath: "/aptitude",
  query: {} as Record<string, string>,
};

const mockUser = {
  id: "user-oncampus-123",
  name: "Nitin Verma",
};

const mockTopics = [
  {
    slug: "percentages",
    questionCount: 25,
    name: "Percentages",
    category: "QUANTITATIVE",
    isLocked: false,
  },
  {
    slug: "blood-relations",
    questionCount: 18,
    name: "Blood Relations",
    category: "LOGICAL",
    isLocked: false,
  },
  {
    slug: "vocabulary",
    questionCount: 30,
    name: "Vocabulary",
    category: "VERBAL",
    isLocked: true,
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
  default: ({ href, children, className }: any) => (
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
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  queryKeys: {
    aptitude: {
      topics: (userId?: string) => ["aptitude", "topics", userId],
      questions: (topic: string, userId?: string) => [
        "aptitude",
        "questions",
        topic,
        userId,
      ],
      studyGuide: (topic: string, userId?: string) => [
        "aptitude",
        "studyGuide",
        topic,
        userId,
      ],
    },
    gamification: {
      points: (userId?: string) => ["gamification", "points", userId],
    },
    interviewPrep: {
      lists: () => ["interviewPrep", "lists"],
    },
  },
  CACHE_TIMES: {
    DEFAULT: {},
    STATIC: {},
    STABLE: {},
  },
}));

vi.mock("@tbe/components", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
  AptitudeQuizPanel: () => (
    <div data-testid="aptitude-quiz-panel">Quiz Panel</div>
  ),
  ContentFeedbackWidget: () => null,
  DsaUpsellModal: () => null,
  FreemiumLockBanner: () => null,
}));

vi.mock("@tbe/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
  sendRequest: vi.fn(),
}));

import AptitudePage from "../../../../oncampus/src/pages/aptitude/index";

describe("OnCampus Aptitude Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter.query = {};

    mocks.useUserMock.mockReturnValue({
      user: mockUser,
      loading: false,
      isAuth: true,
    });

    mocks.useQueryMock.mockImplementation((options: any) => {
      const qKey = options.queryKey;
      if (qKey && qKey[0] === "aptitude" && qKey[1] === "topics") {
        return {
          data: { status: true, data: mockTopics },
          isLoading: false,
        };
      }
      if (qKey && qKey[0] === "aptitude" && qKey[1] === "questions") {
        return {
          data: { status: true, data: { questions: [] } },
          isLoading: false,
        };
      }
      if (qKey && qKey[0] === "aptitude" && qKey[1] === "studyGuide") {
        return {
          data: {
            status: true,
            data: { content: "# Study Guide\n## Introduction" },
          },
          isLoading: false,
        };
      }
      return { data: null, isLoading: false };
    });
  });

  it("renders page header and category filter tabs", () => {
    render(<AptitudePage />);

    expect(screen.getByText("Preparation Vault")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /all topics/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /quantitative/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /logical reasoning/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /verbal ability/i }),
    ).toBeInTheDocument();
  });

  it("filters topics by category when category tab is clicked", () => {
    render(<AptitudePage />);

    const logicalBtn = screen.getByRole("button", {
      name: /logical reasoning/i,
    });
    fireEvent.click(logicalBtn);

    expect(screen.getByText("Blood Relations")).toBeInTheDocument();
  });

  it("filters topics by typing in search input", () => {
    render(<AptitudePage />);

    const searchInput = screen.getByPlaceholderText(
      /search aptitude topics.../i,
    );
    fireEvent.change(searchInput, { target: { value: "Percentages" } });

    expect(screen.getByText("Percentages")).toBeInTheDocument();
    expect(screen.queryByText("Blood Relations")).not.toBeInTheDocument();
  });
});
