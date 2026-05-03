import Cors from "cors";

import initMiddleware from "./initMiddleware";

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];

function isAllowedOrigin(origin: string): boolean {
  if (allowedOrigins.length === 0) return true;
  if (allowedOrigins.includes(origin)) return true;
  try {
    const { hostname } = new URL(origin);
    if (hostname === "localhost" || hostname === "127.0.0.1") return true;
    if (
      hostname === "theboringeducation.com" ||
      hostname.endsWith(".theboringeducation.com")
    )
      return true;
    if (hostname.endsWith(".vercel.app")) return true;
  } catch {
    return false;
  }
  return false;
}

export const cors = initMiddleware(
  Cors({
    origin: (origin, callback) => {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
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
