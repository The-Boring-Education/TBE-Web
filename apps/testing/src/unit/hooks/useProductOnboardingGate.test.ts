import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockSendRequest = vi.fn();
vi.mock("@tbe/utils", () => ({
  sendRequest: (...a: unknown[]) => mockSendRequest(...a),
}));

vi.mock("@tbe/auth", () => ({
  useAuth: vi.fn(),
  getAccessToken: vi.fn(),
}));

import * as auth from "@tbe/auth";
import { useProductOnboardingGate } from "@tbe/hooks/useProductOnboardingGate";

describe("useProductOnboardingGate", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_ONBOARDING_URL", "https://onboarding.test");
    mockSendRequest.mockResolvedValue({ data: { onboarded: false } });
    vi.mocked(auth.useAuth).mockReturnValue({
      user: { id: "u-1", email: "a@b.com" },
      isAuthenticated: true,
      isLoading: false,
    } as ReturnType<typeof auth.useAuth>);
    vi.mocked(auth.getAccessToken).mockReturnValue("access-token");

    // Allow assigning `window.location.href` in JSDOM
    // @ts-expect-error test double
    delete window.location;
    window.location = { ...originalLocation, href: "" } as any;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    window.location = originalLocation as any;
  });

  const opts = () => ({
    pathname: "/dashboard",
    publicRoutes: ["/login"],
    productId: "PREP_YATRA",
    from: "app",
    buildRedirectUrl: () => "https://app.test/after",
    isOnboarded: (u: unknown) =>
      Boolean(
        u && typeof u === "object" && (u as { onboarded?: boolean }).onboarded,
      ),
  });

  it("does not fetch on public routes", async () => {
    const { result } = renderHookWithQuery(() =>
      useProductOnboardingGate({
        ...opts(),
        pathname: "/login",
      }),
    );

    await waitFor(() => {
      expect(result.current.isChecking).toBe(false);
    });
    expect(mockSendRequest).not.toHaveBeenCalled();
  });

  it("sets isChecking while user query is loading", async () => {
    mockSendRequest.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHookWithQuery(() =>
      useProductOnboardingGate({
        ...opts(),
      }),
    );

    expect(result.current.isChecking).toBe(true);
  });

  it("redirects to onboarding when user is not onboarded", async () => {
    mockSendRequest.mockResolvedValue({ data: { onboarded: false } });

    renderHookWithQuery(() => useProductOnboardingGate({ ...opts() }));

    await waitFor(() => {
      expect(window.location.href).toContain("https://onboarding.test/?");
      expect(window.location.href).toContain("userId=u-1");
      expect(window.location.href).toContain("productId=PREP_YATRA");
    });
  });

  it("does not redirect when onboarded", async () => {
    mockSendRequest.mockResolvedValue({ data: { onboarded: true } });
    window.location.href = "";

    renderHookWithQuery(() => useProductOnboardingGate({ ...opts() }));

    await waitFor(() => {
      expect(mockSendRequest).toHaveBeenCalled();
    });

    expect(window.location.href).toBe("");
  });

  it("does not redirect when onboarding URL is missing", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("NEXT_PUBLIC_ONBOARDING_URL", "");
    vi.stubEnv("NEXT_PUBLIC_ONBOARDING_APP_URL", "");
    mockSendRequest.mockResolvedValue({ data: { onboarded: false } });
    window.location.href = "";

    renderHookWithQuery(() => useProductOnboardingGate({ ...opts() }));

    await waitFor(() => {
      expect(mockSendRequest).toHaveBeenCalled();
    });

    expect(window.location.href).toBe("");
  });

  it("sets isChecking to true when user is not onboarded and has finished fetching", async () => {
    mockSendRequest.mockResolvedValue({ data: { onboarded: false } });

    const { result } = renderHookWithQuery(() =>
      useProductOnboardingGate({
        ...opts(),
      }),
    );

    // Should start true because it's fetching
    expect(result.current.isChecking).toBe(true);

    // Wait for the redirect to happen, indicating the fetch finished and logic evaluated
    await waitFor(() => {
      expect(window.location.href).toContain("https://onboarding.test/?");
    });
    expect(result.current.isChecking).toBe(true);
  });

  it("sets isChecking to false when user is onboarded and has finished fetching", async () => {
    mockSendRequest.mockResolvedValue({ data: { onboarded: true } });

    const { result } = renderHookWithQuery(() =>
      useProductOnboardingGate({
        ...opts(),
      }),
    );

    // Should start true because it's fetching
    expect(result.current.isChecking).toBe(true);

    // After fetch resolves, it should be false because they are onboarded
    await waitFor(() => {
      expect(result.current.isChecking).toBe(false);
    });
  });
});
