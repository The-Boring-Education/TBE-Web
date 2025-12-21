import mongoose from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes, envConfig } from "@/lib/constants";
import { sendAPIResponse } from "@/lib/utils";

// Request logging middleware
const SENSITIVE_QUERY_KEYS = [
  "token",
  "auth",
  "authorization",
  "password",
  "pass",
  "secret",
  "key",
  "api_key",
  "apikey",
  "session",
  "sid",
  "id_token",
];

const sanitizeQuery = (
  query: NextApiRequest["query"]
): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(query)) {
    const lowerKey = key.toLowerCase();
    if (
      SENSITIVE_QUERY_KEYS.some((sensitiveKey) =>
        lowerKey.includes(sensitiveKey)
      )
    ) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

const anonymizeIp = (ip: string): string => {
  if (!ip || ip === "unknown") {
    return "unknown";
  }

  // Handle potential multiple IPs in x-forwarded-for
  const baseIp = (ip.split(",")[0] || "").trim();

  if (baseIp.includes(".")) {
    // IPv4: mask the last octet
    const parts = baseIp.split(".");
    if (parts.length === 4) {
      parts[3] = "x";
      return parts.join(".");
    }
    return baseIp;
  }

  if (baseIp.includes(":")) {
    // IPv6: mask the last segment
    const parts = baseIp.split(":");
    if (parts.length > 1) {
      parts[parts.length - 1] = "x";
      return parts.join(":");
    }
    return baseIp;
  }

  return "unknown";
};

const logRequest = (req: NextApiRequest, res: NextApiResponse) => {
  const { method, url, headers, query } = req;
  const rawIp = ((headers["x-forwarded-for"] as string)?.split(",")[0] ||
    headers["x-real-ip"] ||
    "unknown") as string;
  const safeIp = anonymizeIp(rawIp);

  // Log incoming request
  const safeQuery = sanitizeQuery(query);
  const queryStr =
    Object.keys(safeQuery).length > 0
      ? ` | Query: ${JSON.stringify(safeQuery)}`
      : "";
  console.log(
    `📨 [${new Date().toISOString()}] ${method} ${url}${queryStr} | IP: ${safeIp}`
  );
};

// Connect to DB
const connectDB = async () => {
  try {
    // Skip if already connected
    if (mongoose.connection.readyState === 1) {
      console.log("Already connected to MongoDB");
      return;
    }

    await mongoose.connect(envConfig.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error, envConfig.MONGODB_URI);
    throw error;
  }
};

// Admin authentication middleware
const adminMiddleware = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<boolean> => {
  try {
    const adminHeader = req.headers["x-admin-secret"];
    const expectedSecret = process.env.ADMIN_SECRET || "TBEAdmin";

    if (!adminHeader || adminHeader !== expectedSecret) {
      res.status(apiStatusCodes.UNAUTHORIZED).json(
        sendAPIResponse({
          success: false,
          status: apiStatusCodes.UNAUTHORIZED,
          error: true,
          message: "Unauthorized. Admin access required.",
        })
      );
      return false;
    }

    return true;
  } catch (error) {
    res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        success: false,
        status: apiStatusCodes.INTERNAL_SERVER_ERROR,
        error: true,
        message: "Admin authentication error",
        data: error,
      })
    );
    return false;
  }
};

export { adminMiddleware, connectDB, logRequest };
