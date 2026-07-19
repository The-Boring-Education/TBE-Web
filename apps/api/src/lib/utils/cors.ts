import Cors from "cors";

import initMiddleware from "./initMiddleware";

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];

// When no allowlist is configured, reflect all origins in development for
// convenience but fail closed everywhere else (production/preview).
const isDev = process.env.NODE_ENV !== "production";
const originConfig =
  allowedOrigins.length > 0 ? allowedOrigins : isDev ? true : false;

export const cors = initMiddleware(
  Cors({
    origin: originConfig,
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
