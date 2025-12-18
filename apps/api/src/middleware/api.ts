import mongoose from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes, envConfig } from "@/lib/constants";
import { sendAPIResponse } from "@/lib/utils";

// Request logging middleware
const logRequest = (req: NextApiRequest, res: NextApiResponse) => {
  const { method, url, headers, query } = req;
  const ip =
    ((headers["x-forwarded-for"] as string)?.split(",")[0] ||
      headers["x-real-ip"] ||
      "unknown") as string;

  // Log incoming request
  const queryStr = Object.keys(query).length > 0 ? ` | Query: ${JSON.stringify(query)}` : "";
  console.log(
    `📨 [${new Date().toISOString()}] ${method} ${url}${queryStr} | IP: ${ip}`
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

    // Wait for connection to be fully ready
    await new Promise((resolve) => {
      if (mongoose.connection.readyState === 1) {
        resolve(undefined);
      } else {
        mongoose.connection.once("connected", () => resolve(undefined));
      }
    });
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
