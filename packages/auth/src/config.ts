export const AUTH_CONFIG = {
  ACCESS_TOKEN_KEY: "tbe_access_token",
  REFRESH_TOKEN_KEY: "tbe_refresh_token",
  ACCESS_TOKEN_MAX_AGE: 60 * 60 * 24,
  REFRESH_TOKEN_MAX_AGE: 60 * 60 * 24 * 30,
} as const;

export const getAuthApiUrl = (): string => {
  const url = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.VITE_BASE_API_URL ||
    ""
  ).replace(/\/$/, "");

  if (!url) {
    console.warn(
      "[@tbe/auth] NEXT_PUBLIC_API_URL is not set. Auth will not work.",
    );
  }

  return url;
};

// Vite SPAs have no /api/proxy route; their index.html rewrite answers POSTs with 405.
export const isProxyUnavailable = (response: Response): boolean =>
  response.status === 404 || response.status === 405;
