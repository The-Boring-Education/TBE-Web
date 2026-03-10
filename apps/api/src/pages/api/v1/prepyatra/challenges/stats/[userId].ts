import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { Challenge, ChallengeLog } from "@/lib/database";
import { cors } from "@/lib/utils";
import { sendAPIResponse } from "@/lib/utils";
import { connectDB } from "@/middleware/api";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);

  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  await connectDB();
  const { method } = req;

  switch (method) {
    case "GET":
      return handleGetStats(req, res);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        }),
      );
  }
};

const handleGetStats = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "User ID is required",
        }),
      );
    }

    const challenges = await Challenge.find({ user: String(userId) });
    const challengeIds = challenges.map((c) => c._id);

    const logs = await ChallengeLog.find({
      challenge: { $in: challengeIds },
    });

    // Calculate statistics
    const totalChallenges = challenges.length;
    const activeChallenges = challenges.filter((c) => c.isActive).length;
    const completedChallenges = challenges.filter(
      (c) => c.currentDay >= c.totalDays,
    ).length;
    const totalHours = logs.reduce(
      (sum, log) => sum + (log.hoursSpent || 0),
      0,
    );
    const totalDaysLogged = logs.length;

    const stats = {
      userId: String(userId),
      totalChallenges,
      activeChallenges,
      completedChallenges,
      totalHours,
      totalDaysLogged,
      averageHoursPerDay:
        totalDaysLogged > 0
          ? Math.round((totalHours / totalDaysLogged) * 100) / 100
          : 0,
      completionRate:
        totalChallenges > 0
          ? Math.round((completedChallenges / totalChallenges) * 100)
          : 0,
    };

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Stats retrieved successfully",
        data: stats,
      }),
    );
  } catch (error) {
    console.error("Get Challenge Stats Error:", error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    );
  }
};

export default handler;
