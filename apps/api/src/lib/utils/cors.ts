import Cors from "cors";

import { isAllowedTbeUrl } from "./allowed-origins";
import initMiddleware from "./initMiddleware";

export const cors = initMiddleware(
  Cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., server-to-server, Postman)
      if (!origin) {
        callback(null, true);
        return;
      }
      if (isAllowedTbeUrl(origin)) {
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
