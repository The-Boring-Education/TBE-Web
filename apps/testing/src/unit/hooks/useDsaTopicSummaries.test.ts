import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../../packages/hooks/src/useUser.ts", () => ({
  default: () => ({
    user: { id: "test-user", isOnboarded: true },
    isAuth: true,
    loading: false,
    isOnboarded: true,
    updateSession: vi.fn(),
  }),
}));

vi.mock("@tbe/utils", () => ({
  sendRequest: vi.fn(),
}));

import { sendRequest } from "@tbe/utils";

import { useDsaTopicSummaries } from "../../../../../packages/hooks/src/useDsaTopicSummaries";

const mockSendRequest = vi.mocked(sendRequest);

describe("useDsaTopicSummaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should request topic summaries with explicit productType", async () => {
    mockSendRequest.mockResolvedValue({
      status: true,
      data: {
        topics: [{ topic: "ARRAY", count: 10, solved: 3 }],
        effectiveTargetCompanies: ["MNC", "FAANG"],
      },
    });

    const { result } = renderHookWithQuery(() =>
      useDsaTopicSummaries("ONCAMPUS", {
        duration: "6Months",
        offCampus: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.data?.length).toBe(1);
    });

    const call = mockSendRequest.mock.calls[0]?.[0];
    expect(call?.url).toContain("query=topics");
    expect(call?.url).toContain("userId=test-user");
    expect(call?.url).toContain("productType=ONCAMPUS");
    expect(call?.url).toContain("duration=6Months");
    expect(call?.url).toContain("offCampus=true");
    expect(result.current.data?.[0]).toMatchObject({
      topic: "ARRAY",
      count: 10,
      solved: 3,
    });
    expect(result.current.effectiveTargetCompanies).toEqual(["MNC", "FAANG"]);
  });

  it("should surface query error when status is false", async () => {
    mockSendRequest.mockResolvedValue({
      status: false,
      message: "Invalid productType",
      data: null,
    });

    const { result } = renderHookWithQuery(() =>
      useDsaTopicSummaries("ONCAMPUS"),
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe("Invalid productType");
    expect(result.current.data).toEqual([]);
    expect(result.current.effectiveTargetCompanies).toEqual([]);
  });
});
