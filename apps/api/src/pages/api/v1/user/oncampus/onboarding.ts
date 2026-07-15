import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { User } from "@/lib/database/models";
import { toObjectId } from "@/lib/database/queries/common";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import {
  normalizeDsaDuration,
  ONCAMPUS_EXPERIENCE_LEVEL,
} from "@/lib/validation";
import { withUserAuth } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "POST":
      return withUserAuth(async (req, res) => handleOnboarding(req, res), {
        ownerRequired: true,
      })(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        }),
      );
  }
};

const handleOnboarding = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId, duration, offCampus } = req.body;

    if (!userId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Required field: userId",
        }),
      );
    }

    if (!duration) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Required field: duration",
        }),
      );
    }

    const normalizedDuration = normalizeDsaDuration(String(duration));
    if (!normalizedDuration) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Invalid duration. Use 1Month, 3Months, 6Months, or 1Year",
        }),
      );
    }

    const updatePayload: Record<string, unknown> = {
      "oncampus.onboardingCompleted": true,
      "oncampus.duration": normalizedDuration,
      "oncampus.offCampus": offCampus === true || offCampus === "true",
      "oncampus.experienceLevel": ONCAMPUS_EXPERIENCE_LEVEL,
    };

    const updated = await User.findByIdAndUpdate(
      toObjectId(userId),
      { $set: updatePayload },
      { new: true },
    ).select("oncampus");

    if (!updated) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: "User not found",
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: { oncampus: updated.oncampus },
        message: "Onboarding completed successfully",
      }),
    );
  } catch (error) {
    logger.error("POST /api/v1/user/oncampus/onboarding failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed during onboarding",
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
};

export default withApiHandler(handler);
