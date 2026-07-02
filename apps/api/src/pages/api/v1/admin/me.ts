import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { getAdminUserByEmailFromDB } from "@/lib/database";
import { isAdminEmail } from "@/lib/services/admin-cache";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { verifyAuthenticatedUser } from "@/middleware/admin";
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

  const payload = verifyAuthenticatedUser(req);
  if (!payload) {
    return res.status(apiStatusCodes.UNAUTHORIZED).json(
      sendAPIResponse({
        status: false,
        message: "Authentication required",
      }),
    );
  }

  try {
    const userIsAdmin = await isAdminEmail(payload.email);

    if (!userIsAdmin) {
      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          message: "Admin status fetched successfully",
          data: { isAdmin: false },
        }),
      );
    }

    const { data: admin, error } = await getAdminUserByEmailFromDB(
      payload.email,
    );

    if (error) {
      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          message: "Admin status fetched successfully",
          data: { isAdmin: true },
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Admin status fetched successfully",
        data: { isAdmin: true, admin },
      }),
    );
  } catch (error) {
    logger.error("Error fetching admin status", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal server error while fetching admin status",
      }),
    );
  }
};

export default withApiHandler(handler);
