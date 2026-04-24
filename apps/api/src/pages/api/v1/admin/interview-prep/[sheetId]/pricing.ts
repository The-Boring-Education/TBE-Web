import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { updateInterviewSheetInDB } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { adminMiddleware } from "@/middleware/api";
import { withApiHandler } from "@/middleware/requestLogger";

interface UpdateSheetPricingRequest {
  price: number;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const adminCheck = await adminMiddleware(req, res);
  if (!adminCheck) return; // adminMiddleware handles the response

  const { method, query } = req;
  const { sheetId } = query;

  if (!sheetId || typeof sheetId !== "string") {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Sheet ID is required",
      }),
    );
  }

  switch (method) {
    case "PATCH":
      return handleUpdateSheetPricing(req, res, sheetId);

    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${method} not allowed`,
        }),
      );
  }
};

const handleUpdateSheetPricing = async (
  req: NextApiRequest,
  res: NextApiResponse,
  sheetId: string,
) => {
  try {
    const { price }: UpdateSheetPricingRequest = req.body;

    // Validation: Price is required
    if (price === undefined || price === null) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Price is required",
        }),
      );
    }

    // Validate price
    if (price < 0) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Price cannot be negative",
        }),
      );
    }

    const updatedData: { isPremium: boolean; price: number } = {
      isPremium: true,
      price,
    };

    const { data: updatedSheet, error } = await updateInterviewSheetInDB({
      sheetId,
      updatedData,
    });

    if (error) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: error,
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Sheet pricing updated successfully",
        data: updatedSheet,
      }),
    );
  } catch (error) {
    logger.error("Error updating sheet pricing", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal server error while updating sheet pricing",
      }),
    );
  }
};

export default withApiHandler(handler);
