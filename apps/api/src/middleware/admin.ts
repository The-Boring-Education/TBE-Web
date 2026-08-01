import type { NextApiRequest, NextApiResponse } from "next";

import { type AccessTokenPayload, verifyToken } from "@/lib/auth/jwt";
import { extractBearerToken } from "@/lib/auth/token";
import { apiStatusCodes } from "@/lib/constants";
import { isAdminEmail, warmAdminEmailCache } from "@/lib/services/admin-cache";
import { sendAPIResponse } from "@/lib/utils";

export interface AdminAuthenticatedUser {
  id: string;
  email: string;
  name?: string;
}

export interface AdminAuthenticatedRequest extends NextApiRequest {
  adminUser?: AdminAuthenticatedUser;
}

// Re-exported for existing importers; the implementation lives in the
// dependency-light "@/lib/auth/token" module so it can be shared freely.
export { extractBearerToken };

export const verifyJwtAdmin = async (
  req: NextApiRequest,
): Promise<AdminAuthenticatedUser | null> => {
  const token = extractBearerToken(req);
  if (!token) return null;

  try {
    const payload = verifyToken<AccessTokenPayload>(token);
    if (payload.type !== "access") return null;

    await warmAdminEmailCache();
    if (!(await isAdminEmail(payload.email))) {
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
 * Ensures the request is from an authenticated admin user (JWT + RBAC).
 * Non-admin JWT returns 403; invalid/missing JWT returns 401.
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

      await warmAdminEmailCache();
      if (!(await isAdminEmail(payload.email))) {
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

  res.status(apiStatusCodes.UNAUTHORIZED).json(
    sendAPIResponse({
      status: false,
      message: "Authentication required",
    }),
  );
  return false;
};

export const withVerifiedAdminAuth = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void,
): ((req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
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
) => (req: NextApiRequest, res: NextApiResponse) => Promise<void> = (handler) =>
  withVerifiedAdminAuth(async (req, res) =>
    handler(req as AdminAuthenticatedRequest, res),
  );

export const verifyAuthenticatedUser = (
  req: NextApiRequest,
): AccessTokenPayload | null => {
  const token = extractBearerToken(req);
  if (!token) return null;

  try {
    const payload = verifyToken<AccessTokenPayload>(token);
    if (payload.type !== "access") return null;
    return payload;
  } catch {
    return null;
  }
};

const normalizeStringVal = (val: unknown): string | undefined => {
  if (typeof val === "string") {
    return val.trim();
  }
  if (Array.isArray(val)) {
    const first = val[0];
    return typeof first === "string" ? first.trim() : undefined;
  }
  return undefined;
};

export const withUserAuth = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void,
  options?: { ownerRequired?: boolean; allowUnauthenticated?: boolean },
): ((req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const payload = verifyAuthenticatedUser(req);
    if (!payload) {
      if (options?.allowUnauthenticated) {
        return handler(req, res);
      }
      return res.status(apiStatusCodes.UNAUTHORIZED).json(
        sendAPIResponse({
          status: false,
          message: "Authentication required",
        }),
      );
    }

    if (options?.ownerRequired) {
      const queryUserId = req.query.userId;
      const bodyUserId = req.body?.userId;
      const userId =
        normalizeStringVal(queryUserId) || normalizeStringVal(bodyUserId);

      const queryEmail = req.query.email;
      const bodyEmail = req.body?.email;
      const email =
        normalizeStringVal(queryEmail) || normalizeStringVal(bodyEmail);

      const userIsAdmin = await isAdminEmail(payload.email);

      if (!userIsAdmin) {
        if (userId && payload.sub !== userId) {
          return res.status(apiStatusCodes.FORBIDDEN).json(
            sendAPIResponse({
              status: false,
              message: "Access denied: Cannot access another user's resource",
            }),
          );
        }
        if (email) {
          const normalizedPayloadEmail = payload.email.trim().toLowerCase();
          const normalizedTargetEmail = email.trim().toLowerCase();
          if (normalizedPayloadEmail !== normalizedTargetEmail) {
            return res.status(apiStatusCodes.FORBIDDEN).json(
              sendAPIResponse({
                status: false,
                message: "Access denied: Cannot access another user's resource",
              }),
            );
          }
        }
      }
    }

    (req as any).user = payload;
    return handler(req, res);
  };
};
