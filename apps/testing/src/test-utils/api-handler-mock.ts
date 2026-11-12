import type { NextApiRequest, NextApiResponse } from "next";
import { vi } from "vitest";

/**
 * Stand-in for `withApiHandler` in route tests: skips CORS/DB/logging but still
 * applies the declarative `admin` guard so route-level auth stays assertable.
 */

type RouteHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
) => Promise<unknown> | unknown;

interface AdminGuardOptions {
  methods?: readonly string[];
  allowSecret?: boolean;
}

export const adminGuardMock = vi.fn(
  async (_req: NextApiRequest, _res: NextApiResponse) => true,
);

export const withApiHandlerMock =
  (handler: RouteHandler, options?: { admin?: AdminGuardOptions }) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const guard = options?.admin;
    const guarded =
      guard &&
      (!guard.methods ||
        guard.methods.includes((req.method ?? "").toUpperCase()));

    if (guarded && !(await adminGuardMock(req, res))) return;

    return handler(req, res);
  };
