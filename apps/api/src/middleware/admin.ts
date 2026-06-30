import { ADMIN_EMAILS } from "@tbe/constants";
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { type AccessTokenPayload, verifyToken } from "@/lib/auth/jwt";
import { apiStatusCodes } from "@/lib/constants";
import { sendAPIResponse } from "@/lib/utils";
import { adminMiddleware } from "@/middleware/api";

export interface AdminAuthenticatedUser {
  id: string;
  email: string;
  name?: string;
}

export interface AdminAuthenticatedRequest extends NextApiRequest {
  adminUser?: AdminAuthenticatedUser;
}

const AUTH_COOKIE_KEY = "tbe_access_token";

const extractBearerToken = (req: NextApiRequest): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookieHeader = req.headers.cookie || "";
  const match = cookieHeader.match(
    new RegExp(`(?:^|; )${AUTH_COOKIE_KEY}=([^;]+)`),
  );
  return match?.[1] ?? null;
};

export const verifyJwtAdmin = (
  req: NextApiRequest,
): AdminAuthenticatedUser | null => {
  const token = extractBearerToken(req);
  if (!token) return null;

  try {
    const payload = verifyToken<AccessTokenPayload>(token);
    if (payload.type !== "access") return null;
    if (!(ADMIN_EMAILS as readonly string[]).includes(payload.email)) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
};

/**
 * Ensures the request is from an admin user (JWT) or holds a valid x-admin-secret.
 * JWT present but non-admin returns 403; invalid JWT returns 401.
 */
export const ensureAdminAccess = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<boolean> => {
  const token = extractBearerToken(req);

  if (token) {
    try {
      const payload = verifyToken<AccessTokenPayload>(token);
      if (payload.type !== "access") {
        res.status(apiStatusCodes.UNAUTHORIZED).json(
          sendAPIResponse({
            status: false,
            message: "Invalid access token",
          }),
        );
        return false;
      }

      if (!(ADMIN_EMAILS as readonly string[]).includes(payload.email)) {
        res.status(apiStatusCodes.FORBIDDEN).json(
          sendAPIResponse({
            status: false,
            message: "Admin access required",
          }),
        );
        return false;
      }

      (req as AdminAuthenticatedRequest).adminUser = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
      };
      return true;
    } catch {
      res.status(apiStatusCodes.UNAUTHORIZED).json(
        sendAPIResponse({
          status: false,
          message: "Authentication required",
        }),
      );
      return false;
    }
  }

  return adminMiddleware(req, res);
};

export const withVerifiedAdminAuth = (
  handler: NextApiHandler,
): NextApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authorized = await ensureAdminAccess(req, res);
    if (!authorized) return;
    return handler(req, res);
  };
};

export const withAdminAuth: (
  handler: (
    req: AdminAuthenticatedRequest,
    res: NextApiResponse,
  ) => Promise<void> | void,
) => NextApiHandler = (handler) =>
  withVerifiedAdminAuth(async (req, res) =>
    handler(req as AdminAuthenticatedRequest, res),
  );
