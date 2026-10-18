import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  getContributorRankFromDB,
  getOrCreateContributorInDB,
  getUserByIdFromDB,
} from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";
import { getAuthenticatedUserId } from "@/middleware/userAuth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res
      .status(apiStatusCodes.METHOD_NOT_ALLOWED)
      .json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        }),
      );
  }

  const userId = getAuthenticatedUserId(req, res);
  if (!userId) return;

  const { data: user, error: userError } = await getUserByIdFromDB(userId);
  if (userError) {
    return res
      .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        sendAPIResponse({
          status: false,
          message: "Database error while fetching user",
          error: userError,
        }),
      );
  }

  if (!user) {
    return res
      .status(apiStatusCodes.NOT_FOUND)
      .json(
        sendAPIResponse({
          status: false,
          message: "User not found",
        }),
      );
  }

  const { data: contributor, error: contributorError } =
    await getOrCreateContributorInDB({
      userId,
      email: user.email,
      name: user.name || "Contributor",
      avatar: user.image,
    });

  if (contributorError || !contributor) {
    return res
      .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        sendAPIResponse({
          status: false,
          message: "Failed to load profile",
          error: contributorError,
        }),
      );
  }

  const totalXp = contributor.totalXp || 0;
  const level = Math.floor(totalXp / 20) + 1;
  const currentLevelXp = totalXp % 20;
  const nextLevelXp = 20;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / 20) * 100));

  const { data: rank } = await getContributorRankFromDB(totalXp);

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: {
        ...contributor,
        level,
        currentLevelXp,
        nextLevelXp,
        progressPercent,
        rank: rank ?? 1,
      },
    }),
  );
};

export default withApiHandler(handler);
