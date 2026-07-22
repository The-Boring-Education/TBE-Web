import type { NextApiRequest } from "next";

const AUTH_COOKIE_KEY = "tbe_access_token";

/**
 * Extracts the access token from a request, accepting both the
 * `Authorization: Bearer` header and the `tbe_access_token` cookie set by
 * @tbe/auth. Kept dependency-free so it can be shared by any middleware
 * without pulling in the admin/database layers.
 */
export const extractBearerToken = (req: NextApiRequest): string | null => {
  const rawHeader = req.headers.authorization;
  const authHeader = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookieHeader = req.headers.cookie || "";
  const match = cookieHeader.match(
    new RegExp(`(?:^|; )${AUTH_COOKIE_KEY}=([^;]+)`),
  );
  return match?.[1] ?? null;
};
