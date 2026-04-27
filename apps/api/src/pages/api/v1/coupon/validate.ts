import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { validateCouponForProductFromDB } from "@/lib/database";
import type { APIResponseType } from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";
import { rateLimit } from "@/lib/utils/rateLimit";
import { withApiHandler } from "@/middleware/requestLogger";

interface ValidateCouponRequest {
  code: string;
  productId: string;
  productType: string;
  userId?: string;
}

const validateCoupon = async (
  req: NextApiRequest,
  res: NextApiResponse<APIResponseType>,
) => {
  if (req.method !== "POST") {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json({
      status: false,
      message: "Method not allowed",
      data: null,
    });
  }

  // Rate limit: 10 requests per minute per IP
  const allowed = rateLimit(req, res, { maxRequests: 10, windowMs: 60_000 });
  if (!allowed) return;

  try {
    const { code, productId, productType, userId }: ValidateCouponRequest =
      req.body;

    if (!code || !productId || !productType) {
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Code, productId, and productType are required",
        data: null,
      });
    }

    // Validate coupon using database query
    const { data: coupon, error } = await validateCouponForProductFromDB(
      code,
      productId,
      productType,
      userId,
    );

    if (error || !coupon) {
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        status: false,
        message: error || "Invalid coupon code",
        data: null,
      });
    }

    // Return only safe, non-sensitive fields
    return res.status(apiStatusCodes.OKAY).json({
      status: true,
      message: "Coupon validated successfully",
      data: {
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        description: coupon.description,
        minimumAmount: coupon.minimumAmount,
        expiryDate: coupon.expiryDate.toISOString(),
        isValid: coupon.isValid,
      },
    });
  } catch (error) {
    logger.error("Error validating coupon", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

export default withApiHandler(validateCoupon);
