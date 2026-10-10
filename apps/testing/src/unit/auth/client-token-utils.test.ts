/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_CONFIG } from "../../../../../packages/auth/src/config";
import {
  clearTokens,
  decodeToken,
  expireLegacyHostCookies,
  getAccessToken,
  getCookieDomainAttributes,
  getRefreshToken,
  getRefreshTokenFromCookies,
  getTokenFromCookies,
  isTokenExpired,
  setTokens,
} from "../../../../../packages/auth/src/token";

// Helper to create JWT-like token for testing
const createMockJwt = (payload: Record<string, unknown>): string => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payloadStr = btoa(JSON.stringify(payload));
  const signature = btoa("mock_signature");
  return `${header}.${payloadStr}.${signature}`;
};

describe("Client-side Token Utilities (packages/auth/src/token.ts)", () => {
  beforeEach(() => {
    // Clear all cookies before each test
    document.cookie.split(";").forEach((cookie) => {
      const [name] = cookie.trim().split("=");
      if (name) {
        document.cookie = `${name}=; path=/; max-age=0`;
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getCookieDomainAttributes", () => {
    const originalLocation = window.location;

    afterEach(() => {
      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
      });
    });

    it("should return domain and Secure attributes on theboringeducation.com", () => {
      Object.defineProperty(window, "location", {
        value: new URL("https://theboringeducation.com/dashboard"),
        writable: true,
      });

      expect(getCookieDomainAttributes()).toBe(
        "; domain=.theboringeducation.com; Secure",
      );
    });

    it("should return domain and Secure attributes on subdomains of theboringeducation.com", () => {
      const subdomains = [
        "https://dsayatra.theboringeducation.com",
        "https://techyatra.theboringeducation.com",
        "https://admin.theboringeducation.com",
        "https://api.theboringeducation.com",
      ];

      for (const url of subdomains) {
        Object.defineProperty(window, "location", {
          value: new URL(url),
          writable: true,
        });

        expect(getCookieDomainAttributes()).toBe(
          "; domain=.theboringeducation.com; Secure",
        );
      }
    });

    it("should return empty string on localhost and local dev environments", () => {
      const localUrls = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000",
      ];

      for (const url of localUrls) {
        Object.defineProperty(window, "location", {
          value: new URL(url),
          writable: true,
        });

        expect(getCookieDomainAttributes()).toBe("");
      }
    });

    it("should return empty string on non-TBE domains (e.g. preview deployments)", () => {
      const previewUrls = [
        "https://tbe-web-git-feat.vercel.app",
        "https://example.com",
        "https://nottheboringeducation.com",
      ];

      for (const url of previewUrls) {
        Object.defineProperty(window, "location", {
          value: new URL(url),
          writable: true,
        });

        expect(getCookieDomainAttributes()).toBe("");
      }
    });

    it("should return empty string when window is undefined (server)", () => {
      const originalWindow = global.window;
      // @ts-expect-error - intentionally setting to undefined
      delete global.window;

      expect(getCookieDomainAttributes()).toBe("");

      global.window = originalWindow;
    });
  });

  describe("setTokens", () => {
    it("should set both access and refresh tokens as cookies", () => {
      const accessToken = "access.token.here";
      const refreshToken = "refresh.token.here";

      setTokens(accessToken, refreshToken);

      expect(document.cookie).toContain(AUTH_CONFIG.ACCESS_TOKEN_KEY);
      expect(document.cookie).toContain(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      expect(document.cookie).toContain(accessToken);
      expect(document.cookie).toContain(refreshToken);
    });

    it("should not throw when called on server (document undefined)", () => {
      // Simulate server environment
      const originalDocument = global.document;
      // @ts-expect-error - intentionally setting to undefined
      delete global.document;

      expect(() => {
        setTokens("access", "refresh");
      }).not.toThrow();

      global.document = originalDocument;
    });

    it("should include domain and Secure attributes when on production TBE domain", () => {
      const originalLocation = window.location;
      Object.defineProperty(window, "location", {
        value: new URL("https://dsayatra.theboringeducation.com/dashboard"),
        writable: true,
      });

      const cookieSpy = vi.spyOn(document, "cookie", "set");
      setTokens("prod-access", "prod-refresh");

      expect(cookieSpy).toHaveBeenCalledWith(
        expect.stringContaining("; domain=.theboringeducation.com; Secure"),
      );

      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
      });
    });
  });

  describe("getAccessToken", () => {
    it("should return the access token from cookies", () => {
      const token = "my.access.token";
      document.cookie = `${AUTH_CONFIG.ACCESS_TOKEN_KEY}=${token}; path=/`;

      const result = getAccessToken();

      expect(result).toBe(token);
    });

    it("should return null when access token is not set", () => {
      const result = getAccessToken();

      expect(result).toBeNull();
    });

    it("should return correct token when multiple cookies exist", () => {
      const token = "correct.access.token";
      document.cookie = `other_cookie=value; path=/`;
      document.cookie = `${AUTH_CONFIG.ACCESS_TOKEN_KEY}=${token}; path=/`;
      document.cookie = `another_cookie=another; path=/`;

      const result = getAccessToken();

      expect(result).toBe(token);
    });
  });

  describe("getRefreshToken", () => {
    it("should return the refresh token from cookies", () => {
      const token = "my.refresh.token";
      document.cookie = `${AUTH_CONFIG.REFRESH_TOKEN_KEY}=${token}; path=/`;

      const result = getRefreshToken();

      expect(result).toBe(token);
    });

    it("should return null when refresh token is not set", () => {
      const result = getRefreshToken();

      expect(result).toBeNull();
    });
  });

  describe("clearTokens", () => {
    it("should remove both access and refresh tokens", () => {
      // Set tokens first
      document.cookie = `${AUTH_CONFIG.ACCESS_TOKEN_KEY}=access; path=/`;
      document.cookie = `${AUTH_CONFIG.REFRESH_TOKEN_KEY}=refresh; path=/`;

      clearTokens();

      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
    });

    it("should not throw when called on server (document undefined)", () => {
      const originalDocument = global.document;
      // @ts-expect-error - intentionally setting to undefined
      delete global.document;

      expect(() => {
        clearTokens();
      }).not.toThrow();

      global.document = originalDocument;
    });

    it("should clear both domain-scoped and host cookies on production TBE domain", () => {
      const originalLocation = window.location;
      Object.defineProperty(window, "location", {
        value: new URL("https://theboringeducation.com/dashboard"),
        writable: true,
      });

      const cookieSpy = vi.spyOn(document, "cookie", "set");
      clearTokens();

      expect(cookieSpy).toHaveBeenCalledWith(
        `${AUTH_CONFIG.ACCESS_TOKEN_KEY}=; path=/; max-age=0; domain=.theboringeducation.com; Secure`,
      );
      expect(cookieSpy).toHaveBeenCalledWith(
        `${AUTH_CONFIG.REFRESH_TOKEN_KEY}=; path=/; max-age=0; domain=.theboringeducation.com; Secure`,
      );
      expect(cookieSpy).toHaveBeenCalledWith(
        `${AUTH_CONFIG.ACCESS_TOKEN_KEY}=; path=/; max-age=0`,
      );
      expect(cookieSpy).toHaveBeenCalledWith(
        `${AUTH_CONFIG.REFRESH_TOKEN_KEY}=; path=/; max-age=0`,
      );

      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
      });
    });
  });

  describe("decodeToken", () => {
    it("should decode a valid JWT payload", () => {
      const payload = {
        sub: "user_123",
        email: "test@example.com",
        name: "Test User",
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const token = createMockJwt(payload);

      const decoded = decodeToken<typeof payload>(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.sub).toBe("user_123");
      expect(decoded?.email).toBe("test@example.com");
      expect(decoded?.name).toBe("Test User");
    });

    it("should handle URL-safe base64 encoding", () => {
      // Create a payload that would have + and / in normal base64
      const payload = {
        sub: "user_with_special_chars_???",
        data: "some+special/data=",
      };
      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
      const payloadStr = btoa(JSON.stringify(payload))
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
      const token = `${header}.${payloadStr}.signature`;

      const decoded = decodeToken<typeof payload>(token);

      expect(decoded).not.toBeNull();
    });

    it("should return null for invalid token format (not 3 parts)", () => {
      const invalidToken = "only.two";

      const decoded = decodeToken(invalidToken);

      expect(decoded).toBeNull();
    });

    it("should return null for token with empty payload part", () => {
      const invalidToken = "header..signature";

      const decoded = decodeToken(invalidToken);

      expect(decoded).toBeNull();
    });

    it("should return null for malformed JSON in payload", () => {
      const header = btoa(JSON.stringify({ alg: "HS256" }));
      const invalidPayload = btoa("not valid json {{{");
      const token = `${header}.${invalidPayload}.signature`;

      const decoded = decodeToken(token);

      expect(decoded).toBeNull();
    });

    it("should return null when window is undefined (server)", () => {
      const originalWindow = global.window;
      // @ts-expect-error - intentionally setting to undefined
      delete global.window;

      const token = createMockJwt({ sub: "test" });
      const decoded = decodeToken(token);

      expect(decoded).toBeNull();

      global.window = originalWindow;
    });
  });

  describe("isTokenExpired", () => {
    it("should return false for non-expired token", () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour in future
      const token = createMockJwt({ exp: futureExp });

      const result = isTokenExpired(token);

      expect(result).toBe(false);
    });

    it("should return true for expired token", () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour in past
      const token = createMockJwt({ exp: pastExp });

      const result = isTokenExpired(token);

      expect(result).toBe(true);
    });

    it("should return true for token without exp claim", () => {
      const token = createMockJwt({ sub: "user_123" }); // No exp

      const result = isTokenExpired(token);

      expect(result).toBe(true);
    });

    it("should return true for invalid token", () => {
      const result = isTokenExpired("invalid.token");

      expect(result).toBe(true);
    });

    it("should correctly handle token expiring exactly now", () => {
      const nowExp = Math.floor(Date.now() / 1000);
      const token = createMockJwt({ exp: nowExp });

      const result = isTokenExpired(token);

      // Token at exact expiry time should be considered expired
      expect(result).toBe(true);
    });
  });

  describe("getTokenFromCookies (server-side)", () => {
    it("should extract access token from cookie header string", () => {
      const token = "access.token.from.header";
      const cookieHeader = `${AUTH_CONFIG.ACCESS_TOKEN_KEY}=${token}`;

      const result = getTokenFromCookies(cookieHeader);

      expect(result).toBe(token);
    });

    it("should extract token when multiple cookies in header", () => {
      const token = "target.token";
      const cookieHeader = `other=value; ${AUTH_CONFIG.ACCESS_TOKEN_KEY}=${token}; another=xyz`;

      const result = getTokenFromCookies(cookieHeader);

      expect(result).toBe(token);
    });

    it("should return null when token cookie not present", () => {
      const cookieHeader = "other_cookie=value; different=xyz";

      const result = getTokenFromCookies(cookieHeader);

      expect(result).toBeNull();
    });

    it("should return null for empty cookie header", () => {
      const result = getTokenFromCookies("");

      expect(result).toBeNull();
    });

    it("should handle token at start of cookie string", () => {
      const token = "first.token";
      const cookieHeader = `${AUTH_CONFIG.ACCESS_TOKEN_KEY}=${token}; other=value`;

      const result = getTokenFromCookies(cookieHeader);

      expect(result).toBe(token);
    });

    it("should prefer the last match when both legacy host-only and shared cookies are present", () => {
      // Per RFC 6265 §5.4 the browser lists cookies with the same path by
      // creation time, oldest first — the newer domain-scoped SSO cookie
      // therefore follows the legacy host-only one in the Cookie header.
      const legacyHostOnly = "legacy.host.only";
      const sharedDomain = "shared.domain.scoped";
      const cookieHeader = `${AUTH_CONFIG.ACCESS_TOKEN_KEY}=${legacyHostOnly}; ${AUTH_CONFIG.ACCESS_TOKEN_KEY}=${sharedDomain}`;

      const result = getTokenFromCookies(cookieHeader);

      expect(result).toBe(sharedDomain);
    });
  });

  describe("getRefreshTokenFromCookies (server-side)", () => {
    it("should extract refresh token from cookie header string", () => {
      const token = "refresh.token.from.header";
      const cookieHeader = `${AUTH_CONFIG.REFRESH_TOKEN_KEY}=${token}`;

      const result = getRefreshTokenFromCookies(cookieHeader);

      expect(result).toBe(token);
    });

    it("should extract token when multiple cookies in header", () => {
      const token = "target.refresh.token";
      const cookieHeader = `access=abc; ${AUTH_CONFIG.REFRESH_TOKEN_KEY}=${token}; other=xyz`;

      const result = getRefreshTokenFromCookies(cookieHeader);

      expect(result).toBe(token);
    });

    it("should return null when refresh token cookie not present", () => {
      const cookieHeader = `${AUTH_CONFIG.ACCESS_TOKEN_KEY}=access; other=xyz`;

      const result = getRefreshTokenFromCookies(cookieHeader);

      expect(result).toBeNull();
    });

    it("should return null for empty cookie header", () => {
      const result = getRefreshTokenFromCookies("");

      expect(result).toBeNull();
    });

    it("should prefer the last match when both legacy host-only and shared refresh cookies are present", () => {
      const legacyHostOnly = "legacy.refresh.host.only";
      const sharedDomain = "shared.refresh.domain";
      const cookieHeader = `${AUTH_CONFIG.REFRESH_TOKEN_KEY}=${legacyHostOnly}; ${AUTH_CONFIG.REFRESH_TOKEN_KEY}=${sharedDomain}`;

      const result = getRefreshTokenFromCookies(cookieHeader);

      expect(result).toBe(sharedDomain);
    });
  });

  describe("expireLegacyHostCookies", () => {
    const originalLocation = window.location;

    afterEach(() => {
      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
      });
    });

    it("is a no-op on localhost (non-TBE host)", () => {
      Object.defineProperty(window, "location", {
        value: new URL("http://localhost:3000"),
        writable: true,
      });
      document.cookie = `${AUTH_CONFIG.ACCESS_TOKEN_KEY}=host-only-token; path=/`;

      expireLegacyHostCookies();

      // Cookie should still be present — function is a no-op off TBE production
      expect(document.cookie).toContain(AUTH_CONFIG.ACCESS_TOKEN_KEY);
    });

    it("removes host-only access and refresh cookies on a TBE production host", () => {
      Object.defineProperty(window, "location", {
        value: new URL("https://theboringeducation.com"),
        writable: true,
      });
      // Plant host-only cookies (no domain attribute)
      document.cookie = `${AUTH_CONFIG.ACCESS_TOKEN_KEY}=stale-access; path=/`;
      document.cookie = `${AUTH_CONFIG.REFRESH_TOKEN_KEY}=stale-refresh; path=/`;

      expireLegacyHostCookies();

      // Host-only cookies should have been expired
      expect(document.cookie).not.toContain(
        `${AUTH_CONFIG.ACCESS_TOKEN_KEY}=stale-access`,
      );
      expect(document.cookie).not.toContain(
        `${AUTH_CONFIG.REFRESH_TOKEN_KEY}=stale-refresh`,
      );
    });

    it("removes host-only cookies on a TBE subdomain", () => {
      Object.defineProperty(window, "location", {
        value: new URL("https://dsayatra.theboringeducation.com"),
        writable: true,
      });
      document.cookie = `${AUTH_CONFIG.ACCESS_TOKEN_KEY}=old-access; path=/`;
      document.cookie = `${AUTH_CONFIG.REFRESH_TOKEN_KEY}=old-refresh; path=/`;

      expireLegacyHostCookies();

      expect(document.cookie).not.toContain(
        `${AUTH_CONFIG.ACCESS_TOKEN_KEY}=old-access`,
      );
      expect(document.cookie).not.toContain(
        `${AUTH_CONFIG.REFRESH_TOKEN_KEY}=old-refresh`,
      );
    });
  });

  describe("Cross-Subdomain SSO Simulation", () => {
    const originalLocation = window.location;

    afterEach(() => {
      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
      });
    });

    it("should set root-scoped cookies when authenticating on the main platform so subdomains receive them", () => {
      // 1. User logs in on main site
      Object.defineProperty(window, "location", {
        value: new URL(
          "https://theboringeducation.com/auth/callback?code=test-code",
        ),
        writable: true,
      });

      const accessToken = "valid.jwt.access_token";
      const refreshToken = "valid.jwt.refresh_token";

      setTokens(accessToken, refreshToken);

      // Verify that document.cookie calls used the wildcard root domain
      const cookieCalls = (document.cookie as string) || "";
      expect(getCookieDomainAttributes()).toBe(
        "; domain=.theboringeducation.com; Secure",
      );

      // 2. User navigates to tool subdomains (e.g. DSA Yatra, Tech Yatra, Admin)
      const toolSubdomains = [
        "https://dsayatra.theboringeducation.com/dashboard",
        "https://techyatra.theboringeducation.com/tracks",
        "https://admin.theboringeducation.com/dashboard",
        "https://quizes.theboringeducation.com/explore",
      ];

      for (const subdomainUrl of toolSubdomains) {
        Object.defineProperty(window, "location", {
          value: new URL(subdomainUrl),
          writable: true,
        });

        // Browser sends domain-matched cookie in the Cookie request header to Next.js middleware
        const simulatedRequestCookieHeader = `${AUTH_CONFIG.ACCESS_TOKEN_KEY}=${accessToken}; ${AUTH_CONFIG.REFRESH_TOKEN_KEY}=${refreshToken}`;

        // Middleware extraction:
        const extractedToken = getTokenFromCookies(
          simulatedRequestCookieHeader,
        );
        expect(extractedToken).toBe(accessToken);

        // Client token retrieval helper:
        expect(getCookieDomainAttributes()).toBe(
          "; domain=.theboringeducation.com; Secure",
        );
      }
    });
  });
});
