import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { getPricingBannersForProductTypeFromDB } from "@/lib/database";
import type { APIResponseType } from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";
import { withApiHandler } from "@/middleware/requestLogger";

/**
 * Public: active coupons flagged for pricing UIs, scoped by product line.
 * Sorted by expiry ascending (soonest first).
 */
const pricingBanners = async (
  req: NextApiRequest,
  res: NextApiResponse<APIResponseType>,
) => {
  if (req.method !== "GET") {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json({
      status: false,
      message: "Method not allowed",
      data: null,
    });
  }

  try {
    const productType = req.query.productType;
    if (!productType || typeof productType !== "string") {
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        status: false,
        message: "productType query parameter is required",
        data: null,
      });
    }

    const { data, error } =
      await getPricingBannersForProductTypeFromDB(productType);

    if (error || !data) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: error || "Failed to load pricing banners",
        data: null,
      });
    }

    return res.status(apiStatusCodes.OKAY).json({
      status: true,
      message: "OK",
      data,
    });
  } catch (error) {
    logger.error("Error in pricing-banners", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

export default withApiHandler(pricingBanners);
