import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  applyCouponToSheetsFromDB,
  removeCouponFromSheetFromDB,
} from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { firstQueryValue } from "@/lib/validation/queryParams";
import { withVerifiedAdminAuth } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const couponId = firstQueryValue(req.query.couponId);
  const sheetId = firstQueryValue(req.query.sheetId);

  if (!couponId || !sheetId) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Coupon ID and sheet ID are required",
      }),
    );
  }

  switch (req.method) {
    case "POST":
      return handleAddSheetToCoupon(res, couponId, sheetId);

    case "DELETE":
      return handleRemoveSheetFromCoupon(res, couponId, sheetId);

    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} not allowed`,
        }),
      );
  }
};

const handleAddSheetToCoupon = async (
  res: NextApiResponse,
  couponId: string,
  sheetId: string,
) => {
  try {
    const { data: updatedCoupon, error } = await applyCouponToSheetsFromDB(
      couponId,
      [sheetId],
    );

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
        message: "Sheet added to coupon",
        data: updatedCoupon,
      }),
    );
  } catch (error) {
    logger.error("Error adding sheet to coupon", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal server error while adding sheet to coupon",
      }),
    );
  }
};

const handleRemoveSheetFromCoupon = async (
  res: NextApiResponse,
  couponId: string,
  sheetId: string,
) => {
  try {
    const { data: updatedCoupon, error } = await removeCouponFromSheetFromDB(
      couponId,
      sheetId,
    );

    if (error) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: error,
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Sheet removed from coupon",
        data: updatedCoupon,
      }),
    );
  } catch (error) {
    logger.error("Error removing sheet from coupon", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal server error while removing sheet from coupon",
      }),
    );
  }
};

export default withApiHandler(withVerifiedAdminAuth(handler));
