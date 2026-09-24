import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { invalidateHiddenLearnerCache, User } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";
import { getAuthenticatedUserId } from "@/middleware/userAuth";

const toPreferences = (leaderboard?: {
  visible?: boolean;
  emails?: boolean;
  excluded?: boolean;
}) => ({
  visible: leaderboard?.visible !== false,
  emails: leaderboard?.emails !== false,
  excluded: leaderboard?.excluded === true,
});

/**
 * GET   /api/v1/user/leaderboard-preferences
 * PATCH /api/v1/user/leaderboard-preferences  { visible?: boolean, emails?: boolean }
 *
 * Leaderboard Visibility and leaderboard email preference for the authenticated
 * learner. `excluded` is admin-only and read-only here.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET" && req.method !== "PATCH") {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} Not Allowed`,
      }),
    );
  }

  const userId = getAuthenticatedUserId(req, res);
  if (!userId) return;

  if (req.method === "GET") {
    const user = await User.findById(userId, { leaderboard: 1 }).lean();
    if (!user) {
      return res
        .status(apiStatusCodes.NOT_FOUND)
        .json(sendAPIResponse({ status: false, message: "User not found" }));
    }
    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Leaderboard preferences fetched",
        data: toPreferences(user.leaderboard),
      }),
    );
  }

  const { visible, emails } = (req.body ?? {}) as {
    visible?: unknown;
    emails?: unknown;
  };
  const update: Record<string, boolean> = {};
  if (typeof visible === "boolean") update["leaderboard.visible"] = visible;
  if (typeof emails === "boolean") update["leaderboard.emails"] = emails;
  if (Object.keys(update).length === 0) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Provide visible and/or emails as booleans",
      }),
    );
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: update },
    { new: true, projection: { leaderboard: 1 } },
  ).lean();
  if (!user) {
    return res
      .status(apiStatusCodes.NOT_FOUND)
      .json(sendAPIResponse({ status: false, message: "User not found" }));
  }
  invalidateHiddenLearnerCache();

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      message: "Leaderboard preferences updated",
      data: toPreferences(user.leaderboard),
    }),
  );
};

export default withApiHandler(handler);
