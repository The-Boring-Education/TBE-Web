import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRouter = {
  push: vi.fn(),
  pathname: "/coresubjects",
  asPath: "/coresubjects",
  query: {} as Record<string, any>,
};

const mockUser = {
  id: "user-oncampus-123",
  name: "Nitin Verma",
};

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
  CACHE_TIMES: {
    DEFAULT: {},
  },
}));

vi.mock("@tbe/components", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
  ContentFeedbackWidget: () => null,
  DsaUpsellModal: () => null,
  VISUALIZER_MAP: {},
}));

vi.mock("@/components/CoreSubjectMDXRenderer", () => ({
  CoreSubjectMDXRenderer: ({ content }: any) => <div>{content}</div>,
}));

vi.mock("@tbe/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
  sendRequest: vi.fn(),
}));

import CoreSubjectsPage from "../../../../oncampus/src/pages/coresubjects/[[...params]]";

describe("OnCampus Core Subjects Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter.query = {};

    mocks.useUserMock.mockReturnValue({
      user: mockUser,
      loading: false,
      isAuth: true,
    });

    mocks.useQueryMock.mockReturnValue({
      data: { status: true, data: { completedChapters: [] } },
      isLoading: false,
    });
  });

  it("renders core subjects overview list with subjects", () => {
    render(<CoreSubjectsPage />);

    expect(
      screen.getByRole("link", { name: "Core Subjects" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("DBMS").length).toBeGreaterThan(0);
    expect(screen.getAllByText("OOPS").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Operating System").length).toBeGreaterThan(0);
  });

  it("selects a subject when a subject tab is clicked", () => {
    render(<CoreSubjectsPage />);

    const dbmsButton = screen.getByRole("button", { name: /DBMS/i });
    expect(dbmsButton).toBeInTheDocument();
    fireEvent.click(dbmsButton);

    expect(mockRouter.push).toHaveBeenCalledWith(
      "/coresubjects/dbms",
      undefined,
      { shallow: true },
    );
  });
});
