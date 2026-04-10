import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetOnboardingConfig = vi.fn();
const mockIsValidOnboardingProduct = vi.fn();
const mockSendRequest = vi.fn();
const mockTrackEvent = vi.fn();

vi.mock("@tbe/config", () => ({
  getOnboardingConfig: (productId: string) =>
    mockGetOnboardingConfig(productId),
  isValidOnboardingProduct: (productId: string) =>
    mockIsValidOnboardingProduct(productId),
}));

vi.mock("@tbe/utils", () => ({
  sendRequest: (...args: unknown[]) => mockSendRequest(...args),
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}));

import useOnboarding from "@tbe/hooks/useOnboarding";

const mockConfig = {
  id: "test-product",
  name: "Test",
  fields: [
    {
      name: "username",
      step: 1,
      required: true,
      type: "text",
      checkAvailability: true,
    },
    { name: "role", step: 1, required: true, type: "select" },
    { name: "skills", step: 2, required: true, type: "multiselect" },
    { name: "bio", step: 2, required: false, type: "textarea" },
  ],
  api: {
    endpoint: "/user/onboarding",
    method: "POST" as const,
    transformPayload: vi.fn(
      (form: Record<string, unknown>, userId: string) => ({
        ...form,
        userId,
      }),
    ),
  },
};

const mockUser = {
  id: "user-1",
  userName: "testuser",
  email: "test@test.com",
} as any;

describe("useOnboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetOnboardingConfig.mockReturnValue(mockConfig);
    mockIsValidOnboardingProduct.mockReturnValue(true);
  });

  it("starts in loading state", () => {
    mockSendRequest.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHookWithQuery(() =>
      useOnboarding({
        userId: "user-1",
        productId: "test-product",
        redirect: "",
      }),
    );

    expect(result.current.loading).toBe(true);
  });

  it("sets loading=false when userId is missing", async () => {
    const { result } = renderHookWithQuery(() =>
      useOnboarding({ userId: "", productId: "test-product", redirect: "" }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("sets loading=false for invalid product", async () => {
    mockIsValidOnboardingProduct.mockReturnValue(false);

    const { result } = renderHookWithQuery(() =>
      useOnboarding({
        userId: "user-1",
        productId: "invalid-product",
        redirect: "",
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("fetches user and prefills form on mount", async () => {
    mockSendRequest.mockResolvedValue({
      success: true,
      data: mockUser,
    });

    const { result } = renderHookWithQuery(() =>
      useOnboarding({
        userId: "user-1",
        productId: "test-product",
        redirect: "",
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(mockSendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/user?userId=user-1",
        method: "GET",
      }),
    );
  });

  it("handleNext increments step clamped to totalSteps", async () => {
    mockSendRequest.mockResolvedValue({ success: true, data: mockUser });

    const { result } = renderHookWithQuery(() =>
      useOnboarding({
        userId: "user-1",
        productId: "test-product",
        redirect: "",
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.step).toBe(1);

    await act(async () => {
      result.current.handleNext();
    });

    expect(result.current.step).toBe(2);

    await act(async () => {
      result.current.handleNext();
    });

    expect(result.current.step).toBe(2);
  });

  it("handleBack decrements step clamped to 1", async () => {
    mockSendRequest.mockResolvedValue({ success: true, data: mockUser });

    const { result } = renderHookWithQuery(() =>
      useOnboarding({
        userId: "user-1",
        productId: "test-product",
        redirect: "",
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.handleNext();
    });

    expect(result.current.step).toBe(2);

    await act(async () => {
      result.current.handleBack();
    });

    expect(result.current.step).toBe(1);

    await act(async () => {
      result.current.handleBack();
    });

    expect(result.current.step).toBe(1);
  });

  it("isFieldValid returns false when required text field is empty", async () => {
    mockSendRequest.mockResolvedValue({ success: true, data: mockUser });

    const { result } = renderHookWithQuery(() =>
      useOnboarding({
        userId: "user-1",
        productId: "test-product",
        redirect: "",
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isFieldValid).toBe(false);
  });

  it("isFieldValid returns false when required multiselect is empty array", async () => {
    mockSendRequest.mockResolvedValue({ success: true, data: mockUser });

    const { result } = renderHookWithQuery(() =>
      useOnboarding({
        userId: "user-1",
        productId: "test-product",
        redirect: "",
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.setForm({
        username: "testuser",
        role: "student",
        skills: ["js"],
        bio: "",
      });
    });

    await act(async () => {
      result.current.handleNext();
    });

    await act(async () => {
      result.current.setForm((prev: Record<string, unknown>) => ({
        ...prev,
        skills: [],
      }));
    });

    await waitFor(() => {
      expect(result.current.step).toBe(2);
      expect(result.current.isFieldValid).toBe(false);
    });
  });

  it("isFieldValid respects checkAvailability and usernameAvailable", async () => {
    mockSendRequest.mockResolvedValue({ success: true, data: mockUser });

    const { result } = renderHookWithQuery(() =>
      useOnboarding({
        userId: "user-1",
        productId: "test-product",
        redirect: "",
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.setForm({
        username: "taken",
        role: "student",
        skills: ["js"],
        bio: "",
      });
      result.current.setUsernameAvailability(false);
    });

    expect(result.current.isFieldValid).toBe(false);

    await act(async () => {
      result.current.setUsernameAvailability(true);
      result.current.setUsernameChecking(false);
    });

    expect(result.current.isFieldValid).toBe(true);
  });

  it("handleFinish submits form and calls sendRequest", async () => {
    mockSendRequest.mockResolvedValueOnce({ success: true, data: mockUser });
    mockSendRequest.mockResolvedValueOnce({ success: true });

    const { result } = renderHookWithQuery(() =>
      useOnboarding({
        userId: "user-1",
        productId: "test-product",
        redirect: "",
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.setForm({
        username: "testuser",
        role: "student",
        skills: ["js"],
        bio: "",
      });
    });

    await act(async () => {
      result.current.handleFinish();
    });

    await waitFor(() => {
      expect(result.current.submitting).toBe(false);
    });

    expect(mockSendRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        url: "/user/onboarding",
        method: "POST",
        body: expect.objectContaining({
          username: "testuser",
          role: "student",
          skills: ["js"],
          userId: "user-1",
        }),
      }),
    );
  });

  it("handleFinish sets error on API failure", async () => {
    mockSendRequest.mockResolvedValueOnce({ success: true, data: mockUser });
    mockSendRequest.mockRejectedValueOnce(new Error("Server error"));

    const { result } = renderHookWithQuery(() =>
      useOnboarding({
        userId: "user-1",
        productId: "test-product",
        redirect: "",
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.setForm({
        username: "testuser",
        role: "student",
        skills: ["js"],
        bio: "",
      });
    });

    await act(async () => {
      result.current.handleFinish();
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Server error");
    });
  });

  it("sets error for invalid config on handleFinish", async () => {
    mockGetOnboardingConfig.mockReturnValue(null);
    mockSendRequest.mockResolvedValue({ success: true, data: mockUser });

    const { result } = renderHookWithQuery(() =>
      useOnboarding({
        userId: "user-1",
        productId: "unknown-product",
        redirect: "",
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.handleFinish();
    });

    expect(result.current.error).toBe("Invalid product configuration");
    const postCalls = mockSendRequest.mock.calls.filter(
      (call) => call[0]?.method === "POST",
    );
    expect(postCalls).toHaveLength(0);
  });

  it("totalSteps calculated from unique step numbers with fields", async () => {
    mockSendRequest.mockResolvedValue({ success: true, data: mockUser });

    const { result } = renderHookWithQuery(() =>
      useOnboarding({
        userId: "user-1",
        productId: "test-product",
        redirect: "",
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.totalSteps).toBe(2);
  });
});
