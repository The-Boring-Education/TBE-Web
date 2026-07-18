import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { buildUserSocialProfileUpdate } from "@/lib/database";
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
  switch (req.method) {
    case "GET":
      return withUserAuth(async (req, res) => handleGetPreferences(req, res), {
        ownerRequired: true,
      })(req, res);
    case "PATCH":
      return withUserAuth(
        async (req, res) => handlePatchPreferences(req, res),
        {
          ownerRequired: true,
        },
      )(req, res);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        }),
      );
  }
};

const handleGetPreferences = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== "string") {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Required field: userId",
        }),
      );
    }

    const user = await User.findById(toObjectId(userId))
      .select("oncampus")
      .lean();
    if (!user) {
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
        data: user.oncampus || null,
      }),
    );
  } catch (error) {
    logger.error("GET /api/v1/user/oncampus/preferences failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Server error",
      }),
    );
  }
};

const handlePatchPreferences = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const {
      userId,
      duration,
      offCampus,
      name,
      username,
      linkedInUrl,
      githubUrl,
      leetCodeUrl,
    } = req.body;

    if (!userId || typeof userId !== "string") {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Required field: userId",
        }),
      );
    }

    if (
      duration === undefined &&
      offCampus === undefined &&
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

    const update: Record<string, unknown> = {
      "oncampus.experienceLevel": ONCAMPUS_EXPERIENCE_LEVEL,
    };

    if (duration !== undefined) {
      const normalizedDuration = normalizeDsaDuration(String(duration));
      if (!normalizedDuration) {
        return res.status(apiStatusCodes.BAD_REQUEST).json(
          sendAPIResponse({
            status: false,
            message: "Invalid duration. Use 1Month, 3Months, 6Months, or 1Year",
          }),
        );
      }
      update["oncampus.duration"] = normalizedDuration;
    }

    if (offCampus !== undefined) {
      update["oncampus.offCampus"] = offCampus === true || offCampus === "true";
    }

    const socialUpdates = buildUserSocialProfileUpdate({
      name,
      userName: username,
      linkedInUrl,
      githubUrl,
      leetCodeUrl,
    });
    Object.assign(update, socialUpdates);

    const updated = await User.findByIdAndUpdate(
      toObjectId(userId),
      { $set: update },
      { new: true },
    );

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
        data: updated,
      }),
    );
  } catch (error) {
    logger.error("PATCH /api/v1/user/oncampus/preferences failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Server error",
      }),
    );
  }
};

export default withApiHandler(handler);
