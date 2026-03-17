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

const mockFetch = vi.fn();

import usePaymentStatus from "@tbe/hooks/usePaymentStatus";

describe("usePaymentStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
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
    expect(mockFetch).not.toHaveBeenCalled();
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

    expect(mockFetch).not.toHaveBeenCalled();
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

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns isPurchased=true when API confirms purchase", async () => {
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          status: true,
          data: { purchased: true },
        }),
    });

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
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          status: true,
          data: { purchased: false },
        }),
    });

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
    mockFetch.mockRejectedValue(new Error("Network error"));

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
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          status: true,
          data: { purchased: false },
        }),
    });

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
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          status: true,
          data: { purchased: true },
        }),
    });

    renderHookWithQuery(() =>
      usePaymentStatus({
        userId: "user-1",
        productId: "prod-1",
        productType: "INTERVIEW_SHEET",
        isPremium: true,
      }),
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toContain("productType=INTERVIEW_SHEET");
    });
  });
});
