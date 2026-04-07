import type { NextApiRequest, NextApiResponse } from "next";

import { User } from "@/lib/database/models";
import { toObjectId } from "@/lib/database/queries/common";
import { logger } from "@/lib/utils/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    try {
      const { userId } = req.query;
      if (!userId || typeof userId !== "string") {
        return res
          .status(400)
          .json({ status: false, error: "userId required" });
      }

      const user = await User.findById(toObjectId(userId))
        .select("oncampus")
        .lean();

      if (!user) {
        return res.status(404).json({ status: false, error: "User not found" });
      }

      return res.status(200).json({
        status: true,
        data: user.oncampus || null,
      });
    } catch (error) {
      logger.error("GET /api/v1/user/oncampus/preferences failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ status: false, error: "Server error" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const { userId, duration, offCampus } = req.body;
      if (!userId) {
        return res
          .status(400)
          .json({ status: false, error: "userId required" });
      }

      const update: Record<string, unknown> = {};
      if (duration !== undefined) update["oncampus.duration"] = duration;
      if (offCampus !== undefined) update["oncampus.offCampus"] = offCampus;

      const updated = await User.findByIdAndUpdate(
        toObjectId(userId),
        { $set: update },
        { new: true },
      ).select("oncampus");

      if (!updated) {
        return res.status(404).json({ status: false, error: "User not found" });
      }

      return res.status(200).json({ status: true, data: updated.oncampus });
    } catch (error) {
      logger.error("PATCH /api/v1/user/oncampus/preferences failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ status: false, error: "Server error" });
    }
  }

  return res.status(405).json({ status: false, error: "Method not allowed" });
}
