import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { User } from "@/lib/database/models";
import { toObjectId } from "@/lib/database/queries/common";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "POST":
      return handleOnboarding(req, res);
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

    const updatePayload: Record<string, unknown> = {
      "oncampus.onboardingCompleted": true,
      "oncampus.duration": duration,
      "oncampus.offCampus": offCampus === true || offCampus === "true",
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
