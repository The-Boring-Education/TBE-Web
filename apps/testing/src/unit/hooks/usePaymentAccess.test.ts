import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseUser = vi.fn();
const mockSendRequest = vi.fn();

vi.mock("@tbe/hooks/useUser", () => ({
  default: () => mockUseUser(),
}));

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
    sendRequest: (...args: unknown[]) => mockSendRequest(...args),
  };
});

import usePaymentAccess from "@tbe/hooks/usePaymentAccess";

describe("usePaymentAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ user: { id: "user-1" } });
  });

  it("returns hasAccess=true for non-premium products", async () => {
    const { result } = renderHookWithQuery(() =>
      usePaymentAccess({
        productId: "prod-1",
        isPremium: false,
      }),
    );

    await waitFor(() => {
      expect(result.current.hasAccess).toBe(true);
      expect(result.current.isLocked).toBe(false);
      expect(result.current.isPurchased).toBe(true);
    });
  });

  it("returns hasAccess=true when user is already enrolled", async () => {
    const { result } = renderHookWithQuery(() =>
      usePaymentAccess({
        productId: "prod-1",
        isPremium: true,
        isEnrolled: true,
      }),
    );

    // Even though isPremium, enrollment overrides lock
    await waitFor(() => {
      expect(result.current.hasAccess).toBe(true);
      expect(result.current.isLocked).toBe(false);
    });
  });

  it("returns isLocked=true when premium, not enrolled, and not purchased", async () => {
    mockSendRequest.mockResolvedValue({
      status: true,
      data: { purchased: false },
    });

    const { result } = renderHookWithQuery(() =>
      usePaymentAccess({
        productId: "prod-1",
        productType: "DSA_YATRA",
        isPremium: true,
        isEnrolled: false,
      }),
    );

    await waitFor(() => {
      expect(result.current.isLocked).toBe(true);
      expect(result.current.hasAccess).toBe(false);
      expect(result.current.isPurchased).toBe(false);
    });
  });

  it("returns hasAccess=true when premium and purchased", async () => {
    mockSendRequest.mockResolvedValue({
      status: true,
      data: { purchased: true },
    });

    const { result } = renderHookWithQuery(() =>
      usePaymentAccess({
        productId: "prod-1",
        productType: "DSA_YATRA",
        isPremium: true,
        isEnrolled: false,
      }),
    );

    await waitFor(() => {
      expect(result.current.hasAccess).toBe(true);
      expect(result.current.isLocked).toBe(false);
      expect(result.current.isPurchased).toBe(true);
    });
  });

  it("shows loading state while payment status is being checked", async () => {
    // Don't resolve the promise yet — simulate loading
    mockSendRequest.mockReturnValue(new Promise(() => {}));

    const { result } = renderHookWithQuery(() =>
      usePaymentAccess({
        productId: "prod-1",
        productType: "DSA_YATRA",
        isPremium: true,
      }),
    );

    // While loading, isPurchased should be null
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isChecking).toBe(true);
    expect(result.current.isPurchased).toBe(null);
  });

  it("does not check payment status when user is not logged in", async () => {
    mockUseUser.mockReturnValue({ user: null });

    const { result } = renderHookWithQuery(() =>
      usePaymentAccess({
        productId: "prod-1",
        isPremium: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.isPurchased).toBe(null);
    });

    expect(mockSendRequest).not.toHaveBeenCalled();
  });
});
