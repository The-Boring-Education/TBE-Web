import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockBuildGoogleAuthUrl = vi.fn();
const mockSignOAuthState = vi.fn();

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/lib/auth", () => ({
  buildGoogleAuthUrl: (...args: unknown[]) => mockBuildGoogleAuthUrl(...args),
  signOAuthState: (...args: unknown[]) => mockSignOAuthState(...args),
}));

import handler from "../../../../api/src/pages/api/v1/auth/login";

describe("Auth login (OAuth start) API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOAuthState.mockReturnValue("signed-state-token");
    mockBuildGoogleAuthUrl.mockReturnValue(
      "https://accounts.google.com/o/oauth2/v2/auth?state=signed-state-token",
    );
  });

  it("returns 405 for non-GET methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Method not allowed");
  });

  it("returns 400 when redirect_uri is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("redirect_uri is required");
  });

  it("returns 400 when redirect_uri origin is not allowed", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {
        redirect_uri: "https://malicious.example.com/callback",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Invalid redirect_uri origin");
  });

  it("returns 400 for unsupported provider", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {
        redirect_uri: "http://localhost:3000/auth/callback",
        provider: "github",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Unsupported provider");
  });

  it("redirects to Google OAuth for allowed localhost redirect_uri", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {
        redirect_uri: "http://localhost:3000/auth/callback",
      },
    });

    await handler(req, res);

    expect(mockSignOAuthState).toHaveBeenCalledWith(
      "http://localhost:3000/auth/callback",
      "google",
    );
    expect(mockBuildGoogleAuthUrl).toHaveBeenCalledWith("signed-state-token");
    expect(res._getStatusCode()).toBe(302);
    expect(res._getRedirectUrl()).toBe(
      "https://accounts.google.com/o/oauth2/v2/auth?state=signed-state-token",
    );
  });
});
