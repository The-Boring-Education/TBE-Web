import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { getAllUsersWithLogsFromDB } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withVerifiedAdminAuth } from "@/middleware/admin";
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

  return handleGetUsersWithLogs(req, res);
};

const handleGetUsersWithLogs = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    logger.info("getAllUsersWithLogsFromDB");
    const { data, error } = await getAllUsersWithLogsFromDB();

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed to fetch users with logs",
          error,
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Users with logs fetched successfully",
        data,
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Something went wrong while fetching users with logs",
        error,
      }),
    );
  }
};

export default withApiHandler(withVerifiedAdminAuth(handler));
