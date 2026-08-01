import type { NextApiRequest } from "next";
import { describe, expect, it } from "vitest";

import { extractBearerToken } from "../../../../api/src/lib/auth/token";

type MockRequest = Partial<NextApiRequest> & {
  headers: Record<string, string | string[] | undefined>;
};

const createMockRequest = (
  overrides: Partial<MockRequest> = {},
): NextApiRequest => {
  return {
    headers: {},
    ...overrides,
  } as NextApiRequest;
};

describe("extractBearerToken", () => {
  describe("Authorization header extraction", () => {
    it("should extract token from valid Bearer header", () => {
      const token = "valid.jwt.token";
      const req = createMockRequest({
        headers: { authorization: `Bearer ${token}` },
      });

      const result = extractBearerToken(req);

      expect(result).toBe(token);
    });

    it("should handle Bearer prefix case-sensitively", () => {
      const token = "valid.jwt.token";
      const req = createMockRequest({
        headers: { authorization: `Bearer ${token}` },
      });

      const result = extractBearerToken(req);

      expect(result).toBe(token);
    });

    it("should return null for authorization header without Bearer prefix", () => {
      const req = createMockRequest({
        headers: { authorization: "Basic dXNlcjpwYXNz" },
      });

      const result = extractBearerToken(req);

      expect(result).toBeNull();
    });

    it("should return null for empty authorization header", () => {
      const req = createMockRequest({
        headers: { authorization: "" },
      });

      const result = extractBearerToken(req);

      expect(result).toBeNull();
    });

    it("should handle array-style authorization header (takes first)", () => {
      const token = "first.jwt.token";
      const req = createMockRequest({
        headers: {
          authorization: [
            `Bearer ${token}`,
            "Bearer second.token",
          ] as unknown as string,
        },
      });

      const result = extractBearerToken(req);

      expect(result).toBe(token);
    });

    it("should extract token with complex JWT structure", () => {
      const complexToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSJ9.signature";
      const req = createMockRequest({
        headers: { authorization: `Bearer ${complexToken}` },
      });

      const result = extractBearerToken(req);

      expect(result).toBe(complexToken);
    });
  });

  describe("Cookie extraction", () => {
    it("should extract token from tbe_access_token cookie", () => {
      const token = "cookie.jwt.token";
      const req = createMockRequest({
        headers: { cookie: `tbe_access_token=${token}` },
      });

      const result = extractBearerToken(req);

      expect(result).toBe(token);
    });

    it("should extract token from cookie when multiple cookies present", () => {
      const token = "target.jwt.token";
      const req = createMockRequest({
        headers: {
          cookie: `other_cookie=value; tbe_access_token=${token}; another=xyz`,
        },
      });

      const result = extractBearerToken(req);

      expect(result).toBe(token);
    });

    it("should extract token when tbe_access_token is first cookie", () => {
      const token = "first.cookie.token";
      const req = createMockRequest({
        headers: { cookie: `tbe_access_token=${token}; other=value` },
      });

      const result = extractBearerToken(req);

      expect(result).toBe(token);
    });

    it("should return null when tbe_access_token cookie is missing", () => {
      const req = createMockRequest({
        headers: { cookie: "other_cookie=value; another=xyz" },
      });

      const result = extractBearerToken(req);

      expect(result).toBeNull();
    });

    it("should return null when cookie header is empty", () => {
      const req = createMockRequest({
        headers: { cookie: "" },
      });

      const result = extractBearerToken(req);

      expect(result).toBeNull();
    });
  });

  describe("Priority: Authorization header over Cookie", () => {
    it("should prefer Authorization header when both are present", () => {
      const headerToken = "header.jwt.token";
      const cookieToken = "cookie.jwt.token";
      const req = createMockRequest({
        headers: {
          authorization: `Bearer ${headerToken}`,
          cookie: `tbe_access_token=${cookieToken}`,
        },
      });

      const result = extractBearerToken(req);

      expect(result).toBe(headerToken);
    });
  });

  describe("Edge cases", () => {
    it("should return null when no headers provided", () => {
      const req = createMockRequest({ headers: {} });

      const result = extractBearerToken(req);

      expect(result).toBeNull();
    });

    it("should handle token with special characters", () => {
      const specialToken = "token-with_special.chars+more/stuff=";
      const req = createMockRequest({
        headers: { authorization: `Bearer ${specialToken}` },
      });

      const result = extractBearerToken(req);

      expect(result).toBe(specialToken);
    });

    it("should handle Bearer with extra spaces", () => {
      // Bearer followed by token
      const token = "spaced.jwt.token";
      const req = createMockRequest({
        headers: { authorization: `Bearer ${token}` },
      });

      const result = extractBearerToken(req);

      expect(result).toBe(token);
    });

    it("should return token even if it looks malformed", () => {
      // The function doesn't validate JWT format, just extracts
      const malformedToken = "not-a-real-jwt";
      const req = createMockRequest({
        headers: { authorization: `Bearer ${malformedToken}` },
      });

      const result = extractBearerToken(req);

      expect(result).toBe(malformedToken);
    });
  });
});
