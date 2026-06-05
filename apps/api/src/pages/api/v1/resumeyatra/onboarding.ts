import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  buildUserSocialProfileUpdate,
  getUserByIdFromDB,
} from "@/lib/database";
import User from "@/lib/database/models/User";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST" && req.method !== "PATCH") {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} Not Allowed`,
      }),
    );
  }

  try {
    const {
      userId,
      experienceBand,
      from,
      name,
      username,
      linkedInUrl,
      githubUrl,
      leetCodeUrl,
    } = req.body as {
      userId?: string;
      experienceBand?: string;
      from?: string;
      name?: string;
      username?: string;
      linkedInUrl?: string;
      githubUrl?: string;
      leetCodeUrl?: string;
    };

    if (!userId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Required fields: userId",
        }),
      );
    }

    if (
      experienceBand === undefined &&
      name === undefined &&
      username === undefined &&
      linkedInUrl === undefined &&
      githubUrl === undefined &&
      leetCodeUrl === undefined
    ) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "At least one field is required to update",
        }),
      );
    }

    const userResult = await getUserByIdFromDB(userId);
    if (userResult.error || !userResult.data) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: "User not found",
        }),
      );
    }

    const existingUser = userResult.data as { from?: string };
    const updateData: Record<string, unknown> = {
      "resumeYatra.ryOnboarded": true,
    };

    if (experienceBand !== undefined) {
      updateData["resumeYatra.experienceBand"] = experienceBand;
    }

    if (from && !existingUser.from) {
      updateData.from = from;
    }

    const socialUpdates = buildUserSocialProfileUpdate({
      name,
      userName: username,
      linkedInUrl,
      githubUrl,
      leetCodeUrl,
    });
    Object.assign(updateData, socialUpdates);

    const updated = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updated) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Failed to update user",
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: { user: updated },
        message: "Resume Yatra onboarding/profile updated",
      }),
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed during onboarding update",
        error: message,
      }),
    );
  }
};

export default withApiHandler(handler);
