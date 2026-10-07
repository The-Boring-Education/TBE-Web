import mongoose from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { invalidateHiddenLearnerCache, User } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withVerifiedAdminAuth } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

/**
 * PATCH /api/v1/admin/leaderboard/exclusion  { userId: string, excluded: boolean }
 *
 * Leaderboard Exclusion: removes a learner from every leaderboard, Champions and
 * Period Close emails. The learner cannot override it.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PATCH") {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} Not Allowed`,
      }),
    );
  }

  const { userId, excluded } = (req.body ?? {}) as {
    userId?: unknown;
    excluded?: unknown;
  };
  if (
    typeof userId !== "string" ||
    !mongoose.isValidObjectId(userId) ||
    typeof excluded !== "boolean"
  ) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "userId (ObjectId) and excluded (boolean) are required",
      }),
    );
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { "leaderboard.excluded": excluded } },
    { new: true, projection: { name: 1, leaderboard: 1 } },
  ).lean();
  if (!user) {
    return res
      .status(apiStatusCodes.NOT_FOUND)
      .json(sendAPIResponse({ status: false, message: "User not found" }));
  }
  invalidateHiddenLearnerCache();
  logger.info("Leaderboard exclusion changed", { userId, excluded });

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      message: excluded
        ? "Learner excluded from leaderboards"
        : "Learner restored to leaderboards",
      data: { userId, excluded },
    }),
  );
};

export default withApiHandler(withVerifiedAdminAuth(handler));
