import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { ChallengeLog } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "PUT":
      return handleUpdateLog(req, res);
    case "DELETE":
      return handleDeleteLog(req, res);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        }),
      );
  }
};

const handleUpdateLog = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { logId } = req.query;
    const { progressText, hoursSpent, nextGoals } = req.body;

    if (!logId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Log ID is required",
        }),
      );
    }

    const updatedLog = await ChallengeLog.findByIdAndUpdate(
      logId,
      { progressText, hoursSpent, nextGoals },
      { new: true, runValidators: true },
    );

    if (!updatedLog) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: "Log not found",
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Log updated successfully",
        data: updatedLog,
      }),
    );
  } catch (error) {
    logger.error("Update Challenge Log Error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    );
  }
};

const handleDeleteLog = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { logId } = req.query;

    if (!logId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Log ID is required",
        }),
      );
    }

    const deletedLog = await ChallengeLog.findByIdAndDelete(logId);

    if (!deletedLog) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: "Log not found",
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Log deleted successfully",
      }),
    );
  } catch (error) {
    logger.error("Delete Challenge Log Error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    );
  }
};

export default withApiHandler(handler);
