import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import Contributor from "@/lib/database/models/Contributor";
import User from "@/lib/database/models/User";
import { sendAPIResponse } from "@/lib/utils";
import { verifyAuthenticatedUser } from "@/middleware/admin";
import { connectDB } from "@/middleware/api";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} not allowed`,
      }),
    );
  }

  const authUser = verifyAuthenticatedUser(req);
  if (!authUser || !authUser.sub) {
    return res
      .status(apiStatusCodes.UNAUTHORIZED)
      .json(
        sendAPIResponse({ status: false, message: "Authentication required" }),
      );
  }

  try {
    await connectDB();
    let contributor = await Contributor.findOne({ userId: authUser.sub });

    if (!contributor) {
      const user = await User.findById(authUser.sub);
      contributor = await Contributor.create({
        userId: authUser.sub,
        email: authUser.email || user?.email,
        name: authUser.name || user?.name || "Contributor",
        avatar: user?.image || authUser.image || "",
        totalXp: 0,
        role: "Contributor",
        isCaptain: false,
        approvedCount: 0,
        pendingCount: 0,
      });
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: contributor,
        message: "Contributor profile retrieved successfully",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Error retrieving contributor profile",
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
};

export default withApiHandler(handler);
