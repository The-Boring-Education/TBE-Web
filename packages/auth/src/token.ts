import { AUTH_CONFIG } from "./config";

// ── Client-side cookie operations ──

/**
 * Returns domain and security cookie attributes based on current hostname.
 * For production TBE hosts (*.theboringeducation.com), scopes cookies to the
 * shared root domain (.theboringeducation.com) and enforces Secure.
 * For localhost / preview environments, keeps cookies host-only with no domain.
 */
export const getCookieDomainAttributes = (): string => {
  if (typeof window === "undefined") return "";
  const hostname = window.location.hostname;
  if (
    hostname === "theboringeducation.com" ||
    hostname.endsWith(".theboringeducation.com")
  ) {
    return "; domain=.theboringeducation.com; Secure";
  }
  return "";
};

/**
 * Expires legacy host-only auth cookies on the current TBE production host.
 *
 * When the shared-domain cookie was introduced, browsers may hold both a legacy
 * host-only cookie (set before this change) and the new domain-scoped cookie
 * under the same name.  Parsers that take the first `Cookie` header match can
 * therefore read the stale token.  This function removes the host-only copy so
 * the domain-scoped token wins.
 *
 * Only runs on production TBE hosts; a no-op on localhost / preview.
 */
export const expireLegacyHostCookies = (): void => {
  if (typeof document === "undefined") return;
  const domainAttrs = getCookieDomainAttributes();
  if (!domainAttrs) return;
  document.cookie = `${AUTH_CONFIG.ACCESS_TOKEN_KEY}=; path=/; max-age=0`;
  document.cookie = `${AUTH_CONFIG.REFRESH_TOKEN_KEY}=; path=/; max-age=0`;
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof document === "undefined") return;

  const domainAttrs = getCookieDomainAttributes();
  // Expire any pre-SSO host-only cookies so the new domain-scoped ones take precedence.
  if (domainAttrs) {
    document.cookie = `${AUTH_CONFIG.ACCESS_TOKEN_KEY}=; path=/; max-age=0`;
    document.cookie = `${AUTH_CONFIG.REFRESH_TOKEN_KEY}=; path=/; max-age=0`;
  }
  document.cookie = `${AUTH_CONFIG.ACCESS_TOKEN_KEY}=${accessToken}; path=/; max-age=${AUTH_CONFIG.ACCESS_TOKEN_MAX_AGE}; SameSite=Lax${domainAttrs}`;
  document.cookie = `${AUTH_CONFIG.REFRESH_TOKEN_KEY}=${refreshToken}; path=/; max-age=${AUTH_CONFIG.REFRESH_TOKEN_MAX_AGE}; SameSite=Lax${domainAttrs}`;
};

export const getAccessToken = (): string | null => {
  expireLegacyHostCookies();
  return getCookie(AUTH_CONFIG.ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  expireLegacyHostCookies();
  return getCookie(AUTH_CONFIG.REFRESH_TOKEN_KEY);
};

export const clearTokens = (): void => {
  if (typeof document === "undefined") return;
  const domainAttrs = getCookieDomainAttributes();
  document.cookie = `${AUTH_CONFIG.ACCESS_TOKEN_KEY}=; path=/; max-age=0${domainAttrs}`;
  document.cookie = `${AUTH_CONFIG.REFRESH_TOKEN_KEY}=; path=/; max-age=0${domainAttrs}`;
  if (domainAttrs) {
    document.cookie = `${AUTH_CONFIG.ACCESS_TOKEN_KEY}=; path=/; max-age=0`;
    document.cookie = `${AUTH_CONFIG.REFRESH_TOKEN_KEY}=; path=/; max-age=0`;
  }
};

// ── JWT payload decoding (client-side only, no signature verification) ──

/**
 * Client-side convenience helper for reading JWT payload fields in the browser.
 *
 * SECURITY: This function does NOT verify JWT signatures and must never be used
 * for authentication, authorization, or trust decisions.
 *
 * @returns Decoded payload in browser contexts; `null` on server or invalid token.
 */
export const decodeToken = <T = Record<string, unknown>>(
  token: string,
): T | null => {
  if (typeof window === "undefined") return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return null;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return payload as T;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const payload = decodeToken<{ exp: number }>(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 < Date.now();
};

// ── Server-side cookie extraction (for middleware / getServerSideProps) ──

/**
 * Reads the latest value for a cookie name from a raw Cookie header.
 *
 * A browser may send two cookies with the same name — a legacy host-only one
 * (pre-SSO) and the new `.theboringeducation.com` domain-scoped one. Per RFC
 * 6265 §5.4, cookies with the same path are listed by creation time, oldest
 * first, so the newer shared cookie appears last. Preferring the last match
 * avoids the stale host-only token winning the parse during the rollout.
 */
export const getLatestCookieValue = (
  cookieHeader: string,
  name: string,
): string | null => {
  const regex = new RegExp(`(?:^|; )${name}=([^;]+)`, "g");
  let latest: string | null = null;
  let match: RegExpExecArray | null = regex.exec(cookieHeader);
  while (match !== null) {
    if (match[1]) latest = match[1];
    match = regex.exec(cookieHeader);
  }
  return latest;
};

export const getTokenFromCookies = (cookieHeader: string): string | null =>
  getLatestCookieValue(cookieHeader, AUTH_CONFIG.ACCESS_TOKEN_KEY);

export const getRefreshTokenFromCookies = (
  cookieHeader: string,
): string | null =>
  getLatestCookieValue(cookieHeader, AUTH_CONFIG.REFRESH_TOKEN_KEY);

// ── Internal ──

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  return getLatestCookieValue(document.cookie, name);
};
