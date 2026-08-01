import {
  getAuthenticatedUser,
  hasRole,
  isAuthenticated,
} from "@tbe/utils/auth";
import { afterEach, describe, expect, it, vi } from "vitest";

const makeToken = (payload: Record<string, unknown>) => {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64");
  const sig = Buffer.from("sig").toString("base64");
  return `${header}.${body}.${sig}`;
};

describe("auth utils", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getAuthenticatedUser", () => {
    it("returns null when no token is present", async () => {
      const user = await getAuthenticatedUser({ cookies: {}, headers: {} });
      expect(user).toBeNull();
    });

    it("decodes a valid token from the cookie", async () => {
      const token = makeToken({
        sub: "user-1",
        email: "user@example.com",
        name: "Alice",
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      const user = await getAuthenticatedUser({
        cookies: { tbe_access_token: token },
        headers: {},
      });

      expect(user).toEqual({
        id: "user-1",
        email: "user@example.com",
        name: "Alice",
        image: undefined,
      });
    });

    it("decodes a valid token from the Authorization header", async () => {
      const token = makeToken({
        sub: "user-2",
        email: "user2@example.com",
      });

      const user = await getAuthenticatedUser({
        cookies: {},
        headers: { authorization: `Bearer ${token}` },
      });

      expect(user).toEqual({
        id: "user-2",
        email: "user2@example.com",
        name: undefined,
        image: undefined,
      });
    });

    it("returns null when the token is expired", async () => {
      const token = makeToken({
        sub: "user-1",
        email: "user@example.com",
        exp: Math.floor(Date.now() / 1000) - 3600,
      });

      const user = await getAuthenticatedUser({
        cookies: { tbe_access_token: token },
        headers: {},
      });

      expect(user).toBeNull();
    });

    it("returns null and logs an error for a token with invalid base64 payload", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      const token = "header.!!!not-valid-base64json!!!.sig";
      const user = await getAuthenticatedUser({
        cookies: { tbe_access_token: token },
        headers: {},
      });

      expect(user).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it("returns null (without logging) for a token missing the payload segment", async () => {
      const user = await getAuthenticatedUser({
        cookies: { tbe_access_token: "not-a-jwt" },
        headers: {},
      });

      expect(user).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("returns true when a valid user is found", async () => {
      const token = makeToken({ sub: "user-1", email: "user@example.com" });
      const result = await isAuthenticated({
        cookies: { tbe_access_token: token },
        headers: {},
      });
      expect(result).toBe(true);
    });

    it("returns false when no user is found", async () => {
      const result = await isAuthenticated({ cookies: {}, headers: {} });
      expect(result).toBe(false);
    });
  });

  describe("hasRole", () => {
    it("returns true for any role when the user is authenticated", async () => {
      const token = makeToken({ sub: "user-1", email: "user@example.com" });
      const result = await hasRole(
        { cookies: { tbe_access_token: token }, headers: {} },
        "admin",
      );
      expect(result).toBe(true);
    });

    it("returns false when the user is not authenticated", async () => {
      const result = await hasRole({ cookies: {}, headers: {} }, "admin");
      expect(result).toBe(false);
    });
  });
});
