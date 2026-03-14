import mongoose from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";

import { envConfig } from "@/lib/constants";

interface ServiceHealthStatus {
  status: "healthy" | "unhealthy" | "unknown";
  responseTime?: number;
  url: string;
  error?: string;
}

interface OverallHealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  services: {
    database: ServiceHealthStatus;
    quizzes: ServiceHealthStatus;
    onboarding: ServiceHealthStatus;
  };
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
    unknown: number;
  };
}

async function checkServiceHealth(
  serviceName: string,
  serviceUrl: string,
  timeout = 5000,
): Promise<ServiceHealthStatus> {
  const startTime = Date.now();

  if (!serviceUrl) {
    return {
      status: "unknown",
      url: "not-configured",
      error: `${serviceName.toUpperCase()}_APP_URL environment variable not configured`,
    };
  }

  try {
    // Try health endpoint first, then fallback to root
    const healthUrl = `${serviceUrl}/api/health`;
    const fallbackUrl = serviceUrl;

    let response;
    try {
      response = await fetch(healthUrl, {
        method: "GET",
        timeout,
        headers: {
          "User-Agent": "TBE-Health-Check/1.0",
        },
      } as RequestInit);
    } catch (error) {
      response = await fetch(fallbackUrl, {
        method: "GET",
        timeout,
        headers: {
          "User-Agent": "TBE-Health-Check/1.0",
        },
      } as RequestInit);
    }

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        status: "healthy",
        responseTime,
        url: serviceUrl,
      };
    } else {
      return {
        status: "unhealthy",
        responseTime,
        url: serviceUrl,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return {
      status: "unhealthy",
      responseTime,
      url: serviceUrl,
      error: errorMessage,
    };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OverallHealthResponse>,
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end();
  }

  try {
    const checkDatabaseHealth = async (): Promise<ServiceHealthStatus> => {
      const start = Date.now();
      try {
        if (mongoose.connection.readyState !== 1) {
          await mongoose.connect(envConfig.MONGODB_URI);
        }
        await mongoose.connection.db?.admin().ping();
        return {
          status: "healthy",
          responseTime: Date.now() - start,
          url: "mongodb",
        };
      } catch (error) {
        return {
          status: "unhealthy",
          responseTime: Date.now() - start,
          url: "mongodb",
          error: error instanceof Error ? error.message : "Connection failed",
        };
      }
    };

    const [databaseHealth, quizzesHealth, onboardingHealth] = await Promise.all(
      [
        checkDatabaseHealth(),
        checkServiceHealth("quizzes", envConfig.QUIZ_APP_URL),
        checkServiceHealth("onboarding", envConfig.ONBOARDING_URL),
      ],
    );

    const services = {
      database: databaseHealth,
      quizzes: quizzesHealth,
      onboarding: onboardingHealth,
    };

    // Calculate summary
    const statuses = Object.values(services).map((service) => service.status);
    const summary = {
      total: statuses.length,
      healthy: statuses.filter((status) => status === "healthy").length,
      unhealthy: statuses.filter((status) => status === "unhealthy").length,
      unknown: statuses.filter((status) => status === "unknown").length,
    };

    // Determine overall status
    let overallStatus: "healthy" | "degraded" | "unhealthy";
    if (summary.healthy === summary.total) {
      overallStatus = "healthy";
    } else if (summary.healthy > 0) {
      overallStatus = "degraded";
    } else {
      overallStatus = "unhealthy";
    }

    // Set appropriate HTTP status code
    const httpStatus =
      overallStatus === "healthy"
        ? 200
        : overallStatus === "degraded"
          ? 207
          : 503;

    const response: OverallHealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services,
      summary,
    };

    res.status(httpStatus).json(response);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      services: {
        database: { status: "unknown", url: "mongodb", error: errorMessage },
        quizzes: { status: "unknown", url: "error", error: errorMessage },
        onboarding: { status: "unknown", url: "error", error: errorMessage },
      },
      summary: { total: 3, healthy: 0, unhealthy: 0, unknown: 3 },
    });
  }
}
