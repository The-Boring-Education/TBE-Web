import crypto from "crypto";
import mongoose from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes, envConfig } from "@/lib/constants";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";

let indexesSynced = false;

const syncAllIndexes = async () => {
  if (indexesSynced) return;
  indexesSynced = true;

  try {
    const modelNames = mongoose.modelNames();
    const results = await Promise.allSettled(
      modelNames.map((name) => mongoose.model(name).syncIndexes()),
    );

    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      logger.warn("Some model indexes failed to sync", {
        failedCount: failed.length,
        errors: failed.map((r) =>
          r.status === "rejected" ? String(r.reason) : "",
        ),
      });
    } else {
      logger.info("All model indexes synced", {
        modelCount: modelNames.length,
      });
    }
  } catch (error) {
    logger.error("syncAllIndexes failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) return;
    await mongoose.connect(envConfig.MONGODB_URI);
    logger.info("Connected to MongoDB");
    await syncAllIndexes();
  } catch (error) {
    logger.error("Error connecting to MongoDB", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
};

// Admin authentication middleware
const adminMiddleware = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<boolean> => {
  try {
    const adminHeader = req.headers["x-admin-secret"];
    const expectedSecret = process.env.ADMIN_SECRET;

    if (!expectedSecret) {
      logger.error("ADMIN_SECRET environment variable is not set");
      res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          success: false,
          status: apiStatusCodes.INTERNAL_SERVER_ERROR,
          error: true,
          message: "Server configuration error",
        }),
      );
      return false;
    }

    if (
      !adminHeader ||
      typeof adminHeader !== "string" ||
      adminHeader.length !== expectedSecret.length ||
      !crypto.timingSafeEqual(
        Buffer.from(adminHeader),
        Buffer.from(expectedSecret),
      )
    ) {
      logger.warn("Admin auth failed", {
        ip:
          (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
          "unknown",
        timestamp: new Date().toISOString(),
      });
      res.status(apiStatusCodes.UNAUTHORIZED).json(
        sendAPIResponse({
          success: false,
          status: apiStatusCodes.UNAUTHORIZED,
          error: true,
          message: "Unauthorized. Admin access required.",
        }),
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
      }),
    );
    return false;
  }
};

export { adminMiddleware, connectDB };
