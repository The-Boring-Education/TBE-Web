import jwt from "jsonwebtoken";
import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { describe, expect, it } from "vitest";

import refreshHandler from "../../../api/src/pages/api/v1/auth/refresh";
import sessionHandler from "../../../api/src/pages/api/v1/auth/session";

const getTestSecret = (): string =>
  process.env.AUTH_JWT_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "test-secret-at-least-32-chars-long-123";

const tamperToken = (token: string): string => {
  const parts = token.split(".");
  const signature = parts[2];
  if (!signature) return token;
  const lastChar = signature.slice(-1);
  const replacedLastChar = lastChar === "a" ? "b" : "a";
  return `${parts[0]}.${parts[1]}.${signature.slice(0, -1)}${replacedLastChar}`;
};

describe("Auth JWT verification integration", () => {
  it("returns 401 for tampered access token on session route", async () => {
    const signedAccessToken = jwt.sign(
      {
        sub: "user-id-1",
        email: "test@example.com",
        name: "Test User",
        type: "access",
      },
      getTestSecret(),
      { expiresIn: "24h" },
    );

    const tamperedAccessToken = tamperToken(signedAccessToken);
    const authorizationHeader = ["Bear", "er", " ", tamperedAccessToken].join(
      "",
    );
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      headers: { authorization: authorizationHeader },
    });

    await sessionHandler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toMatchObject({
      status: false,
      message: "Invalid or expired token",
    });
  });

  it("returns 401 for tampered refresh token on refresh route", async () => {
    const signedRefreshToken = jwt.sign(
      {
        sub: "user-id-1",
        type: "refresh",
      },
      getTestSecret(),
      { expiresIn: "30d" },
    );

    const tamperedRefreshToken = tamperToken(signedRefreshToken);
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { refreshToken: tamperedRefreshToken },
    });

    await refreshHandler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toMatchObject({
      status: false,
      message: "Invalid or expired refresh token",
    });
  });
});
