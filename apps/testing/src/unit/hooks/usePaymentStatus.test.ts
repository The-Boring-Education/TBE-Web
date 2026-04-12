import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/constants", () => ({
  routes: {
    api: {
      base: "https://api.test.com",
      checkStatus: "/payment/checkstatus",
    },
  },
}));

vi.mock("@tbe/auth", () => ({
  getAccessToken: vi.fn().mockReturnValue(null),
}));

vi.mock("@tbe/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tbe/utils")>();
  return {
    ...actual,
    sendRequest: vi.fn(),
  };
});

import usePaymentStatus from "@tbe/hooks/usePaymentStatus";
import { sendRequest } from "@tbe/utils";

const mockSendRequest = vi.mocked(sendRequest);

describe("usePaymentStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("non-premium products always return isPurchased=true, isLocked=false", async () => {
    const { result } = renderHookWithQuery(() =>
      usePaymentStatus({
        userId: "user-1",
        productId: "prod-1",
        isPremium: false,
      }),
    );

    await waitFor(() => {
      expect(result.current.isPurchased).toBe(true);
    });

    expect(result.current.isLocked).toBe(false);
    expect(mockSendRequest).not.toHaveBeenCalled();
  });

  it("returns isPurchased=null when userId is missing (query disabled)", async () => {
    const { result } = renderHookWithQuery(() =>
      usePaymentStatus({
        userId: "",
        productId: "prod-1",
        isPremium: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.isPurchased).toBe(null);
    });

    expect(mockSendRequest).not.toHaveBeenCalled();
  });

  it("returns isPurchased=null when productId is missing (query disabled)", async () => {
    const { result } = renderHookWithQuery(() =>
      usePaymentStatus({
        userId: "user-1",
        productId: "",
        isPremium: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.isPurchased).toBe(null);
    });

    expect(mockSendRequest).not.toHaveBeenCalled();
  });

  it("returns isPurchased=true when API confirms purchase", async () => {
    mockSendRequest.mockResolvedValue({
      status: true,
      data: { purchased: true },
    } as any);

    const { result } = renderHookWithQuery(() =>
      usePaymentStatus({
        userId: "user-1",
        productId: "prod-1",
        isPremium: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.isPurchased).toBe(true);
    });

    expect(result.current.isLocked).toBe(false);
  });

  it("returns isPurchased=false when API says not purchased", async () => {
    mockSendRequest.mockResolvedValue({
      status: true,
      data: { purchased: false },
    } as any);

    const { result } = renderHookWithQuery(() =>
      usePaymentStatus({
        userId: "user-1",
        productId: "prod-1",
        isPremium: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.isPurchased).toBe(false);
    });
  });

  it("returns isPurchased=null on network error (query errors, no data)", async () => {
    mockSendRequest.mockRejectedValue(new Error("Network error"));

    const { result } = renderHookWithQuery(() =>
      usePaymentStatus({
        userId: "user-1",
        productId: "prod-1",
        isPremium: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.isPurchased).toBe(null);
    });
  });

  it("isLocked is true when isPremium=true AND isPurchased=false", async () => {
    mockSendRequest.mockResolvedValue({
      status: true,
      data: { purchased: false },
    } as any);

    const { result } = renderHookWithQuery(() =>
      usePaymentStatus({
        userId: "user-1",
        productId: "prod-1",
        isPremium: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.isPurchased).toBe(false);
      expect(result.current.isLocked).toBe(true);
    });
  });

  it("passes productType in query params when provided", async () => {
    mockSendRequest.mockResolvedValue({
      status: true,
      data: { purchased: true },
    } as any);

    renderHookWithQuery(() =>
      usePaymentStatus({
        userId: "user-1",
        productId: "prod-1",
        productType: "INTERVIEW_SHEET",
        isPremium: true,
      }),
    );

    await waitFor(() => {
      expect(mockSendRequest).toHaveBeenCalled();
      const callArgs = mockSendRequest.mock.calls[0][0];
      expect(callArgs.url).toContain("productType=INTERVIEW_SHEET");
    });
  });
});
