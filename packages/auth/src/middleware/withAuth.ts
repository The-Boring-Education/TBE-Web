import type { NextApiRequest, NextApiResponse } from "next";

import { AUTH_CONFIG } from "../config";
import { getLatestCookieValue } from "../token";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  isOnboarded?: boolean;
}

export interface AuthenticatedRequest extends NextApiRequest {
  user: AuthenticatedUser;
}

export const decodeJwtPayload = (
  token: string,
): Record<string, unknown> | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return null;
    return JSON.parse(Buffer.from(parts[1], "base64").toString());
  } catch {
    return null;
  }
};

/**
 * @deprecated WARNING: This middleware does NOT verify JWT signatures.
 * It only base64-decodes the payload. An attacker can forge any user identity.
 * DO NOT use on API routes that protect data or perform mutations.
 * Use `getAuthenticatedUserId` from `apps/api/src/middleware/userAuth.ts` instead,
 * which calls `verifyToken` with full signature verification.
 *
 * This function is kept only for non-sensitive client-side rendering hints
 * (e.g. showing UI based on decoded token claims before server verification).
 */
export const withAuth = (
  handler: (
    req: AuthenticatedRequest,
    res: NextApiResponse,
  ) => Promise<void> | void,
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Prefer the raw Cookie header's last match: during the SSO rollout a
    // legacy host-only cookie can precede the new domain-scoped one, and
    // Next.js's `req.cookies` parser keeps only the first occurrence (the stale
    // host-only value). Fall back to `req.cookies` and `Authorization` header
    // if the raw header is unavailable (e.g. test harnesses).
    const rawCookieHeader = req.headers.cookie || "";
    const token =
      getLatestCookieValue(rawCookieHeader, AUTH_CONFIG.ACCESS_TOKEN_KEY) ||
      req.cookies?.[AUTH_CONFIG.ACCESS_TOKEN_KEY] ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Authentication required",
      });
    }

    const payload = decodeJwtPayload(token);
    if (
      !payload ||
      (typeof payload.exp === "number" && payload.exp * 1000 < Date.now())
    ) {
      return res.status(401).json({
        status: false,
        message: "Token expired or invalid",
      });
    }

    (req as AuthenticatedRequest).user = {
      id: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string | undefined,
      image: payload.image as string | undefined,
      isOnboarded: payload.isOnboarded as boolean | undefined,
    };

    return handler(req as AuthenticatedRequest, res);
  };
};

export const withAdminAuth = (adminEmails: string[]) => {
  return (
    handler: (
      req: AuthenticatedRequest,
      res: NextApiResponse,
    ) => Promise<void> | void,
  ) => {
    return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
      if (!adminEmails.includes(req.user.email)) {
        return res.status(403).json({
          status: false,
          message: "Admin access required",
        });
      }
      return handler(req, res);
    });
  };
};

/**
 * For use in Next.js Edge middleware — reads auth state from request cookies.
 * Uses atob() which is available in Edge Runtime.
 *
 * During the SSO rollout a browser may send two `tbe_access_token` cookies — a
 * legacy host-only one and the new domain-scoped one. We walk candidates from
 * last to first (per RFC 6265 §5.4 the newer, domain-scoped cookie is listed
 * last) and accept the first that decodes to a non-expired payload.
 */
export const getAuthFromRequest = (
  request: Request,
): { isAuthenticated: boolean; user: AuthenticatedUser | null } => {
  const cookieHeader = request.headers.get("cookie") || "";
  const regex = new RegExp(
    `(?:^|; )${AUTH_CONFIG.ACCESS_TOKEN_KEY}=([^;]+)`,
    "g",
  );
  const tokenCandidates: string[] = [];
  let match: RegExpExecArray | null = regex.exec(cookieHeader);
  while (match !== null) {
    if (match[1]) tokenCandidates.push(match[1]);
    match = regex.exec(cookieHeader);
  }

  for (let i = tokenCandidates.length - 1; i >= 0; i -= 1) {
    const token = tokenCandidates[i];
    if (!token) continue;

    try {
      const parts = token.split(".");
      if (parts.length !== 3 || !parts[1]) continue;

      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
      );

      if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
        continue;
      }

      return {
        isAuthenticated: true,
        user: {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          image: payload.image,
          isOnboarded: payload.isOnboarded,
        },
      };
    } catch {
      continue;
    }
  }

  return { isAuthenticated: false, user: null };
};
