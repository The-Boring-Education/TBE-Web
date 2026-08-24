import Cors from "cors";

import initMiddleware from "./initMiddleware";

/**
 * Checks if the origin is allowed based on known TBE domain patterns.
 */
function isAllowedOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);

    // Allow localhost for development
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return true;
    }

    // Allow production TBE domains
    if (
      hostname === "theboringeducation.com" ||
      hostname.endsWith(".theboringeducation.com")
    ) {
      return true;
    }

    // Allow TBE Vercel preview deployments only. These follow the team's
    // `tbe-<project>-...-tbe.vercel.app` naming (the trailing `-tbe` is the team
    // slug). Requiring BOTH the `tbe-` prefix and the `-tbe.vercel.app` suffix
    // scopes this to the TBE namespace, instead of the previous suffix-only match
    // that also allowed any attacker-created `evil-tbe.vercel.app` project.
    if (hostname.startsWith("tbe-") && hostname.endsWith("-tbe.vercel.app")) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export const cors = initMiddleware(
  Cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., server-to-server, Postman)
      if (!origin) {
        callback(null, true);
        return;
      }
      if (isAllowedOrigin(origin)) {
        callback(null, origin);
      } else {
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: false,
    allowedHeaders: [
      // Standard headers
      "Content-Type",
      "Authorization",
      "Accept",
      "Accept-Language",
      "Accept-Encoding",

      // Custom headers
      "x-admin-secret",
      "x-agents-env",
      "cache",

      // Browser security headers (Client Hints)
      "sec-ch-ua",
      "sec-ch-ua-mobile",
      "sec-ch-ua-platform",
      "sec-fetch-site",
      "sec-fetch-mode",
      "sec-fetch-dest",

      // Standard browser headers
      "referer",
      "user-agent",
      "origin",
    ],
    exposedHeaders: ["Content-Length", "Content-Type"],
  }),
);
