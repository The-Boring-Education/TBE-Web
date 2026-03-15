import type { NextApiRequest, NextApiResponse } from "next";

import { getUserAnalyticsFromDB } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withApiHandler } from "@/middleware/requestLogger";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json(sendAPIResponse({ status: false, message: "Method not allowed" }));
  }

  const { userId } = req.query;
  const { categoryName } = req.query;

  // Validation
  if (!userId || typeof userId !== "string") {
    return res
      .status(400)
      .json(sendAPIResponse({ status: false, message: "User ID is required" }));
  }

  try {
    const { data: analytics, error } = await getUserAnalyticsFromDB(
      userId,
      categoryName as string,
    );

    if (error) {
      return res
        .status(400)
        .json(
          sendAPIResponse({ status: false, message: "Error occurred", error }),
        );
    }

    // Format the response for frontend consumption
    const formattedAnalytics =
      analytics?.map((analytic: any) => ({
        userId: analytic.userId,
        categoryName: analytic.categoryName,
        totalAttempts: analytic.totalAttempts,
        bestScore: analytic.bestScore,
        averageScore: Math.round(analytic.averageScore * 10) / 10,
        totalTimeSpent: analytic.totalTimeSpent,
        strengthAreas: analytic.strengthAreas,
        improvementAreas: analytic.improvementAreas,
        difficultyPerformance: {
          easy: {
            attempts: analytic.difficultyPerformance.easy.attempts,
            successRate: Math.round(
              analytic.difficultyPerformance.easy.successRate * 100,
            ),
          },
          medium: {
            attempts: analytic.difficultyPerformance.medium.attempts,
            successRate: Math.round(
              analytic.difficultyPerformance.medium.successRate * 100,
            ),
          },
          hard: {
            attempts: analytic.difficultyPerformance.hard.attempts,
            successRate: Math.round(
              analytic.difficultyPerformance.hard.successRate * 100,
            ),
          },
        },
        progressTimeline: analytic.progressTimeline.map((entry: any) => ({
          date: entry.date,
          score: entry.score,
          difficulty: entry.difficulty,
          timeSpent: entry.timeSpent,
        })),
        lastAttemptAt: analytic.lastAttemptAt,
      })) || [];

    res.status(200).json(
      sendAPIResponse({
        status: true,
        data: formattedAnalytics,
      }),
    );
  } catch (error) {
    logger.error("Error fetching user analytics", {
      error: error instanceof Error ? error.message : String(error),
    });
    res
      .status(500)
      .json(
        sendAPIResponse({ status: false, message: "Internal server error" }),
      );
  }
}

export default withApiHandler(handler);
