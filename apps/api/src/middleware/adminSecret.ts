import crypto from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { sendAPIResponse } from "@/lib/utils";

const extractHeader = (req: NextApiRequest): string | undefined => {
  const raw = req.headers["x-admin-secret"];
  if (Array.isArray(raw)) {
    return typeof raw[0] === "string" ? raw[0] : undefined;
  }
  return typeof raw === "string" ? raw : undefined;
};

/**
 * Constant-time comparison that never throws. Returns false when either input
 * is empty or the two differ in length.
 */
const constantTimeEquals = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length === 0 || bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
};

/**
 * Non-fatal check: does the request carry a valid `x-admin-secret`?
 *
 * Fails closed — returns false (never true) when `ADMIN_SECRET` is unset or the
 * header is missing/mismatched. Use this where a matching secret only unlocks
 * extra behavior rather than gating the whole route.
 */
export const matchesAdminSecret = (req: NextApiRequest): boolean => {
  const configured = process.env.ADMIN_SECRET;
  if (!configured) {
    return false;
  }
  const header = extractHeader(req);
  if (!header) {
    return false;
  }
  return constantTimeEquals(header, configured);
};

/**
 * Route guard for `x-admin-secret`-protected endpoints.
 *
 * Fail-closed: if `ADMIN_SECRET` is not configured, responds 500 and returns
 * false rather than letting an anonymous request through (the previous inline
 * `header !== process.env.ADMIN_SECRET` pattern let `undefined === undefined`
 * pass when the env var was missing). Otherwise responds 401 on a missing or
 * mismatched header. Returns true only on an exact, constant-time match.
 */
export const verifyAdminSecret = (
  req: NextApiRequest,
  res: NextApiResponse,
): boolean => {
  const configured = process.env.ADMIN_SECRET;
  if (!configured) {
    res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Server misconfiguration: admin secret is not set",
      }),
    );
    return false;
  }

  const header = extractHeader(req);
  if (!header || !constantTimeEquals(header, configured)) {
    res
      .status(apiStatusCodes.UNAUTHORIZED)
      .json(sendAPIResponse({ status: false, message: "Unauthorized" }));
    return false;
  }

  return true;
};
