import type { NextApiRequest, NextApiResponse } from "next";

import type { AccessTokenPayload } from "@/lib/auth/jwt";
import { verifyToken } from "@/lib/auth/jwt";
import { extractBearerToken } from "@/lib/auth/token";
import { apiStatusCodes } from "@/lib/constants";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";

/**
 * Extracts and verifies the authenticated user from the request.
 * Accepts both the `Authorization: Bearer` header and the `tbe_access_token`
 * cookie set by @tbe/auth, so existing cookie-based sessions keep working.
 * Returns the userId (sub) on success, or null after sending a 401 response.
 */
export const getAuthenticatedUserId = (
  req: NextApiRequest,
  res: NextApiResponse,
): string | null => {
  const token = extractBearerToken(req);

  if (!token) {
    res.status(apiStatusCodes.UNAUTHORIZED).json(
      sendAPIResponse({
        status: false,
        message: "Authentication required",
      }),
    );
    return null;
  }

  try {
    const payload = verifyToken<AccessTokenPayload>(token);
    if (payload.type === "access" && payload.sub) {
      return payload.sub;
    }
    res.status(apiStatusCodes.UNAUTHORIZED).json(
      sendAPIResponse({
        status: false,
        message: "Invalid token type",
      }),
    );
    return null;
  } catch (error) {
    logger.warn("JWT verification failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(apiStatusCodes.UNAUTHORIZED).json(
      sendAPIResponse({
        status: false,
        message: "Invalid or expired token",
      }),
    );
    return null;
  }
};

/**
 * Verifies the authenticated user owns the resource being accessed.
 * Compares the token userId against the client-supplied userId.
 * Returns the verified userId or null (after sending 403).
 */
export const verifyOwnership = (
  authenticatedUserId: string,
  requestedUserId: string | undefined,
  res: NextApiResponse,
): boolean => {
  if (!requestedUserId || requestedUserId === authenticatedUserId) {
    return true;
  }

  res.status(apiStatusCodes.FORBIDDEN).json(
    sendAPIResponse({
      status: false,
      message: "Cannot access another user's data",
    }),
  );
  return false;
};
