import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { getUserByIdFromDB } from "@/lib/database";
import User from "@/lib/database/models/User";
import { sendAPIResponse } from "@/lib/utils";
import { withUserAuth } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} Not Allowed`,
      }),
    );
  }

  return withUserAuth(
    async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        const { userId, focus, from } = req.body as {
          userId?: string;
          focus?: string;
          from?: string;
        };

        if (!userId || !focus) {
          return res.status(apiStatusCodes.BAD_REQUEST).json(
            sendAPIResponse({
              status: false,
              message: "Required fields: userId, focus",
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

        const updateData: Record<string, unknown> = {
          isOnboarded: true,
          "techYatra.tyOnboarded": true,
          "techYatra.focus": focus,
        };

        const existingFrom = (userResult.data as { from?: string }).from;
        if (from && !existingFrom) {
          updateData.from = from;
        }

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
            message: "Tech Yatra onboarding completed",
          }),
        );
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
          sendAPIResponse({
            status: false,
            message: "Failed during onboarding",
            error: message,
          }),
        );
      }
    },
    { ownerRequired: true, allowUnauthenticated: true },
  )(req, res);
};

export default withApiHandler(handler);
