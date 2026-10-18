import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes, type ContributionStatusType } from "@/lib/constants";
import { getContributionsForAdminFromDB } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { ensureAdminAccess } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

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

  const isAdmin = await ensureAdminAccess(req, res);
  if (!isAdmin) return;

  const {
    status,
    category,
    search,
    page = "1",
    limit = "20",
  } = req.query as {
    status?: ContributionStatusType | "all";
    category?: any;
    search?: string;
    page?: string;
    limit?: string;
  };

  const { data, error } = await getContributionsForAdminFromDB({
    status,
    category,
    search,
    page: Math.max(1, parseInt(page, 10) || 1),
    limit: Math.min(100, Math.max(1, parseInt(limit, 10) || 20)),
  });

  if (error) {
    return res
      .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        sendAPIResponse({
          status: false,
          message: "Failed to fetch moderation queue",
          error,
        }),
      );
  }

  return res
    .status(apiStatusCodes.OKAY)
    .json(sendAPIResponse({ status: true, data }));
};

export default withApiHandler(handler);
