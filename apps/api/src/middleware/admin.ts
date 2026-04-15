import type { AuthenticatedRequest } from "@tbe/auth";
import { withAdminAuth as withAdminAuthBase } from "@tbe/auth";
import type { NextApiHandler, NextApiResponse } from "next";

const ADMIN_EMAILS = [
  "theboringeducation@gmail.com",
  // Add more admin emails here
];

export const withAdminAuth: (
  handler: (
    req: AuthenticatedRequest,
    res: NextApiResponse,
  ) => Promise<void> | void,
) => NextApiHandler = withAdminAuthBase(ADMIN_EMAILS);
