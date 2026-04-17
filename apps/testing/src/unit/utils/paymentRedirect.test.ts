import { resolvePaymentSuccessContinueHref } from "@tbe/utils";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("resolvePaymentSuccessContinueHref", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses DSA Yatra dev origin when productType is DSA_YATRA and next is relative", () => {
    vi.stubEnv("NODE_ENV", "development");

    expect(
      resolvePaymentSuccessContinueHref({
        nextQuery: "/dashboard",
        productType: "DSA_YATRA",
        platformFallbackPath: "/user/dashboard",
      }),
    ).toBe("http://localhost:3005/dashboard");
  });

  it("preserves allowed absolute next URL", () => {
    vi.stubEnv("NODE_ENV", "development");

    expect(
      resolvePaymentSuccessContinueHref({
        nextQuery: "http://localhost:3005/dashboard",
        productType: "DSA_YATRA",
        platformFallbackPath: "/user/dashboard",
      }),
    ).toBe("http://localhost:3005/dashboard");
  });

  it("uses platform relative path for non-subscription products", () => {
    vi.stubEnv("NODE_ENV", "development");

    expect(
      resolvePaymentSuccessContinueHref({
        nextQuery: "/interview-prep",
        productType: "INTERVIEW_SHEET",
        platformFallbackPath: "/user/dashboard",
      }),
    ).toBe("/interview-prep");
  });

  it("uses DSA Yatra env override when set", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_DSAYATRA_APP_URL", "https://custom.example.com");

    expect(
      resolvePaymentSuccessContinueHref({
        nextQuery: "/dashboard",
        productType: "DSA_YATRA",
        platformFallbackPath: "/user/dashboard",
      }),
    ).toBe("https://custom.example.com/dashboard");
  });

  it("maps legacy platform default /user/dashboard to /dashboard for subscription apps", () => {
    vi.stubEnv("NODE_ENV", "development");

    expect(
      resolvePaymentSuccessContinueHref({
        nextQuery: "/user/dashboard",
        productType: "DSA_YATRA",
        platformFallbackPath: "/user/dashboard",
      }),
    ).toBe("http://localhost:3005/dashboard");
  });
});
