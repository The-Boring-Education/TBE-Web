import mongoose from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";

import { envConfig } from "@/lib/constants";
import { logger } from "@/lib/utils/logger";
import { ensureAdminAccess } from "@/middleware/admin";

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

// Deprecated compatibility wrapper. Admin auth now requires JWT + RBAC.
const adminMiddleware = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<boolean> => {
  return ensureAdminAccess(req, res);
};

export { adminMiddleware, connectDB };
