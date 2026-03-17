import type { NextApiRequest, NextApiResponse } from "next";

import { AUTH_CONFIG } from "../config";

interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  isOnboarded?: boolean;
}

interface AuthenticatedRequest extends NextApiRequest {
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
 * Lightweight API route middleware — decodes JWT from cookie or Authorization header.
 * Does NOT verify signature (the centralized API does that on data-mutating calls).
 */
export const withAuth = (
  handler: (
    req: AuthenticatedRequest,
    res: NextApiResponse,
  ) => Promise<void> | void,
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token =
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
 */
export const getAuthFromRequest = (
  request: Request,
): { isAuthenticated: boolean; user: AuthenticatedUser | null } => {
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(
    new RegExp(`(?:^|; )${AUTH_CONFIG.ACCESS_TOKEN_KEY}=([^;]+)`),
  );

  if (!tokenMatch?.[1]) {
    return { isAuthenticated: false, user: null };
  }

  try {
    const parts = tokenMatch[1].split(".");
    if (parts.length !== 3 || !parts[1]) {
      return { isAuthenticated: false, user: null };
    }

    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
    );

    if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
      return { isAuthenticated: false, user: null };
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
    return { isAuthenticated: false, user: null };
  }
};
