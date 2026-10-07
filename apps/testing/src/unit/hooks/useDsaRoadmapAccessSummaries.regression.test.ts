import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

vi.mock("../../../../../packages/hooks/src/useUser.ts", () => ({
  default: () => ({
    user: { id: "roadmap-user" },
    isAuth: true,
    loading: false,
  }),
}));
vi.mock("@tbe/utils", () => ({
  sendRequest: async ({ url }: { url: string }) => {
    const response = await fetch(url);
    return response.json();
  },
}));
vi.mock("@tbe/constants", () => ({
  routes: { api: { base: "https://roadmap.test", dsaSheet: "/dsa-sheet" } },
  TOPIC_LABELS: { ARRAY: "Array", GRAPH: "Graph" },
}));

import { useDsaTopicSummaries } from "@tbe/hooks/useDsaTopicSummaries";

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("roadmap summary access fields regression", () => {
  it("preserves zero accessible counts independently of catalog totals and solved counts", async () => {
    server.use(
      http.get("https://roadmap.test/dsa-sheet", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("productType")).toBe("DSA_YATRA");
        expect(url.searchParams.get("userId")).toBe("roadmap-user");
        return HttpResponse.json({
          status: true,
          data: {
            topics: [
              {
                topic: "ARRAY",
                count: 8,
                solved: 6,
                accessibleCount: 3,
                accessibleSolved: 2,
              },
              {
                topic: "GRAPH",
                count: 4,
                solved: 4,
                accessibleCount: 0,
                accessibleSolved: 0,
              },
            ],
          },
        });
      }),
    );
    const { result } = renderHookWithQuery(() => useDsaTopicSummaries());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([
      {
        topic: "ARRAY",
        label: "Array",
        count: 8,
        solved: 6,
        accessibleCount: 3,
        accessibleSolved: 2,
      },
      {
        topic: "GRAPH",
        label: "Graph",
        count: 4,
        solved: 4,
        accessibleCount: 0,
        accessibleSolved: 0,
      },
    ]);
  });

  it("does not infer access from legacy totals and ignores malformed or unknown topics", async () => {
    server.use(
      http.get("https://roadmap.test/dsa-sheet", () =>
        HttpResponse.json({
          status: true,
          data: {
            topics: [
              null,
              {},
              { topic: "UNKNOWN" },
              { topic: "ARRAY", count: 10, solved: 8 },
            ],
          },
        }),
      ),
    );
    const { result } = renderHookWithQuery(() => useDsaTopicSummaries());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([
      {
        topic: "ARRAY",
        label: "Array",
        count: 10,
        solved: 8,
        accessibleCount: 0,
        accessibleSolved: 0,
      },
    ]);
  });
});
