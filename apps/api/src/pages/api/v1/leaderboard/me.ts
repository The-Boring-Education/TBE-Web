import { LEADERBOARD_PERIOD_TYPES } from "@tbe/constants";
import { getPeriodKey, getPeriodResetsAt } from "@tbe/utils/leaderboard";
import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  getChampionBadgeCounts,
  getViewerStanding,
  User,
} from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";
import { getAuthenticatedUserId } from "@/middleware/userAuth";

/**
 * GET /api/v1/leaderboard/me
 *
 * The authenticated learner's standing in every current Period, their Champion
 * Badge counts and leaderboard preferences.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} Not Allowed`,
      }),
    );
  }

  const userId = getAuthenticatedUserId(req, res);
  if (!userId) return;

  const now = new Date();
  const [standings, badges, user] = await Promise.all([
    Promise.all(
      LEADERBOARD_PERIOD_TYPES.map(async (type) => {
        const periodKey = getPeriodKey(type, now);
        const standing = await getViewerStanding(type, periodKey, userId);
        return [
          type,
          {
            ...standing,
            periodKey,
            resetsAt: getPeriodResetsAt(type, now).toISOString(),
          },
        ] as const;
      }),
    ),
    getChampionBadgeCounts(userId),
    User.findById(userId, { leaderboard: 1 }).lean(),
  ]);

  res.setHeader("Cache-Control", "private, no-store");
  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      message: "Leaderboard standing fetched successfully",
      data: {
        standings: Object.fromEntries(standings),
        badges,
        preferences: {
          visible: user?.leaderboard?.visible !== false,
          emails: user?.leaderboard?.emails !== false,
          excluded: user?.leaderboard?.excluded === true,
        },
      },
    }),
  );
};

export default withApiHandler(handler);
