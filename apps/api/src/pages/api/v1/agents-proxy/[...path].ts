import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withVerifiedAdminAuth } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

/**
 * Authenticated proxy to The-Boring-Agents service.
 *
 * The admin dashboard previously called the Agents API directly from the browser
 * with no authentication, leaving those endpoints (quiz/interview generation)
 * open to anyone who knew the URL. All admin agent traffic now flows through this
 * route, gated by `withVerifiedAdminAuth` (JWT + AdminUser allowlist), so the
 * Agents service is never reachable directly from the client bundle.
 *
 * The admin app's runtime environment switcher is preserved via the
 * `x-agents-env` header (local | dev | prod), mapped here to a server-side
 * allowlist of Agents base URLs.
 */

type AgentsEnv = "local" | "dev" | "prod";

const AGENTS_BASE_BY_ENV: Record<AgentsEnv, string> = {
  local: process.env.AGENTS_API_BASE || "http://localhost:8000/api/v1",
  dev:
    process.env.AGENTS_API_BASE_DEV ||
    "https://tbe-agents-dev.vercel.app/api/v1",
  prod:
    process.env.AGENTS_API_BASE_PROD ||
    "https://tbe-agents-prod.vercel.app/api/v1",
};

const resolveAgentsEnv = (req: NextApiRequest): AgentsEnv => {
  const raw = req.headers["x-agents-env"];
  const value = (Array.isArray(raw) ? raw[0] : raw)?.toLowerCase();
  if (value === "dev" || value === "prod" || value === "local") {
    return value;
  }
  return "local";
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const agentsEnv = resolveAgentsEnv(req);
  const base = AGENTS_BASE_BY_ENV[agentsEnv].replace(/\/$/, "");

  const { path } = req.query;
  const agentsPath = Array.isArray(path) ? path.join("/") : path || "";

  // Drop the catch-all `path` param so it is not appended to the upstream query.
  const { path: _catchAll, ...forwardQuery } = req.query;

  const url = `${base}/${agentsPath}`;

  try {
    const response = await axios({
      method: req.method as string,
      url,
      // Do NOT forward the platform Authorization/cookies to the Agents service;
      // only pass through the content type and body.
      headers: {
        "Content-Type": req.headers["content-type"] || "application/json",
      },
      data: req.body,
      params: forwardQuery,
      timeout: 60_000,
      validateStatus: () => true,
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Agents proxy error", { url, agentsEnv, message });
    return res.status(502).json(
      sendAPIResponse({
        status: false,
        message: "Failed to reach the Agents service",
      }),
    );
  }
};

export default withApiHandler(withVerifiedAdminAuth(handler));
