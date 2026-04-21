import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { getUserPrepLogStats } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      return handleGetProgress(req, res);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} not allowed`,
        }),
      );
  }
};

const handleGetProgress = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== "string") {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Missing or invalid userId",
        }),
      );
    }

    const { data, error } = await getUserPrepLogStats(userId);

    if (error) {
      const isUserNotFound = error === "User not found";
      return res
        .status(
          isUserNotFound
            ? apiStatusCodes.NOT_FOUND
            : apiStatusCodes.INTERNAL_SERVER_ERROR,
        )
        .json(
          sendAPIResponse({
            status: false,
            message: error,
          }),
        );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Something went wrong while fetching prep progress",
        error,
      }),
    );
  }
};

export default withApiHandler(handler);
