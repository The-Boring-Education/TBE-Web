import type { RoadmapNode } from "@tbe/interface";
import type { DsaTopicSummaryRow } from "@tbe/types";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  summaries: vi.fn(),
  roadmap: vi.fn(),
}));

vi.mock("@tbe/hooks", () => ({
  useDsaTopicSummaries: mocks.summaries,
}));
vi.mock("@tbe/components", () => ({
  InteractiveRoadmap: (props: unknown) => {
    mocks.roadmap(props);
    return null;
  },
  SEO: () => null,
}));
vi.mock("@tbe/constants", () => ({
  TOPIC_LABELS: {
    ARRAY: "Array",
    STRING: "String",
    GRAPH: "Graph",
    TREE: "Tree",
  },
  compareDsaTopicKeys: (a: string, b: string) => a.localeCompare(b),
  DSA_TOPIC_ROADMAP_ICON_MAP: {},
  PAGE_REFRESH_TIMEOUT: { veryVeryLong: 60 },
  routes: { dsayatra: { home: "/", visualizers: "/visualizers" } },
}));
vi.mock("@tbe/utils", () => ({
  cn: () => "",
  getPreFetchProps: vi.fn(),
}));
vi.mock("next/router", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("next/head", () => ({ default: () => null }));
vi.mock("next/link", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("framer-motion", () => ({
  motion: { div: () => null },
}));

import TopicsPage from "../../../../dsayatra/src/pages/topics";

const renderRoadmap = (rows?: DsaTopicSummaryRow[]) => {
  mocks.summaries.mockReturnValue({ data: rows });
  render(
    <TopicsPage
      slug="topics"
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
  return mocks.roadmap.mock.lastCall?.[0] as {
    nodes: RoadmapNode[];
    overallProgress: number;
    stats: { label: string; value: number }[];
  };
};

describe("roadmap freemium locks and progress regression", () => {
  beforeEach(() => vi.clearAllMocks());

  it("locks paid-only and empty topics and computes progress from accessible primary questions", () => {
    const roadmap = renderRoadmap([
      {
        topic: "ARRAY",
        count: 5,
        solved: 4,
        accessibleCount: 3,
        accessibleSolved: 2,
      },
      {
        topic: "STRING",
        count: 2,
        solved: 2,
        accessibleCount: 0,
        accessibleSolved: 0,
      },
      {
        topic: "GRAPH",
        count: 3,
        solved: 1,
        accessibleCount: 1,
        accessibleSolved: 1,
      },
    ]);
    expect(roadmap.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "ARRAY",
          total: 3,
          solved: 2,
          isLocked: false,
        }),
        expect.objectContaining({
          id: "STRING",
          total: 0,
          solved: 0,
          isLocked: true,
        }),
        expect.objectContaining({
          id: "TREE",
          total: 0,
          solved: 0,
          isLocked: true,
        }),
      ]),
    );
    expect(roadmap.overallProgress).toBe(75);
    expect(roadmap.stats).toEqual([
      { label: "Topics", value: 2 },
      { label: "Mastered", value: 1 },
      { label: "Potential", value: 2 },
    ]);
  });

  it("uses all questions for paid users but keeps empty topics locked", () => {
    const roadmap = renderRoadmap([
      {
        topic: "ARRAY",
        count: 5,
        solved: 4,
        accessibleCount: 5,
        accessibleSolved: 4,
      },
      {
        topic: "STRING",
        count: 2,
        solved: 2,
        accessibleCount: 2,
        accessibleSolved: 2,
      },
      {
        topic: "GRAPH",
        count: 3,
        solved: 1,
        accessibleCount: 3,
        accessibleSolved: 1,
      },
    ]);
    expect(roadmap.overallProgress).toBe(70);
    expect(
      roadmap.nodes.filter((node) => node.isLocked).map((node) => node.id),
    ).toEqual(["TREE"]);
  });

  it.each([undefined, []])(
    "does not unlock topics without accessible data (%s)",
    (rows) => {
      const roadmap = renderRoadmap(rows);
      expect(roadmap.overallProgress).toBe(0);
      expect(roadmap.nodes.every((node) => node.isLocked)).toBe(true);
    },
  );
});
