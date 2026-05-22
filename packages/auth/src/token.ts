import { AUTH_CONFIG } from "./config";

// ── Client-side cookie operations ──

export const setTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof document === "undefined") return;

  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${AUTH_CONFIG.ACCESS_TOKEN_KEY}=${accessToken}; path=/; max-age=${AUTH_CONFIG.ACCESS_TOKEN_MAX_AGE}; SameSite=Lax${secure}`;
  document.cookie = `${AUTH_CONFIG.REFRESH_TOKEN_KEY}=${refreshToken}; path=/; max-age=${AUTH_CONFIG.REFRESH_TOKEN_MAX_AGE}; SameSite=Lax${secure}`;
};

export const getAccessToken = (): string | null => {
  return getCookie(AUTH_CONFIG.ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return getCookie(AUTH_CONFIG.REFRESH_TOKEN_KEY);
};

export const clearTokens = (): void => {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_CONFIG.ACCESS_TOKEN_KEY}=; path=/; max-age=0`;
  document.cookie = `${AUTH_CONFIG.REFRESH_TOKEN_KEY}=; path=/; max-age=0`;
};

// ── JWT decoding (no verification — server does that) ──

export const decodeToken = <T = Record<string, unknown>>(
  token: string,
): T | null => {
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

export const getTokenFromCookies = (cookieHeader: string): string | null => {
  const match = cookieHeader.match(
    new RegExp(`(?:^|; )${AUTH_CONFIG.ACCESS_TOKEN_KEY}=([^;]+)`),
  );
  return match?.[1] ?? null;
};

export const getRefreshTokenFromCookies = (
  cookieHeader: string,
): string | null => {
  const match = cookieHeader.match(
    new RegExp(`(?:^|; )${AUTH_CONFIG.REFRESH_TOKEN_KEY}=([^;]+)`),
  );
  return match?.[1] ?? null;
};

// ── Internal ──

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match?.[1] ?? null;
}
