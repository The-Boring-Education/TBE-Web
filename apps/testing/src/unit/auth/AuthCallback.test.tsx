import { AuthCallback } from "@tbe/auth";
import { render, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("AuthCallback", () => {
  const originalLocation = window.location;
  const fetchMock = vi.fn();

  const stubLocation = (search: string) => {
    // @ts-expect-error test double
    delete window.location;
    window.location = {
      ...originalLocation,
      origin: "http://localhost:3008",
      search,
      href: "",
    } as unknown as Location;
  };

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        status: true,
        data: { accessToken: "access", refreshToken: "refresh" },
      }),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
    // @ts-expect-error test double
    window.location = originalLocation;
  });

  it.each([
    ["/dashboard", "/dashboard"],
    ["https://evil.com/phish", "/"],
    ["//evil.com", "/"],
    ["javascript:alert(1)", "/"],
  ])(
    "redirects returnTo=%s to %s after a successful sign-in",
    async (returnTo, expected) => {
      stubLocation(`?code=abc&returnTo=${encodeURIComponent(returnTo)}`);
      render(<AuthCallback />);
      await waitFor(() => expect(window.location.href).toBe(expected));
    },
  );

  it("sends failed sign-ins to /login by default", () => {
    vi.useFakeTimers();
    stubLocation("?error=access_denied");
    render(<AuthCallback />);
    vi.advanceTimersByTime(2000);
    expect(window.location.href).toBe("/login?error=access_denied");
  });

  it("sends failed sign-ins to a custom loginPath", () => {
    vi.useFakeTimers();
    stubLocation("?error=access_denied");
    render(<AuthCallback loginPath="/" />);
    vi.advanceTimersByTime(2000);
    expect(window.location.href).toBe("/?error=access_denied");
  });
});
