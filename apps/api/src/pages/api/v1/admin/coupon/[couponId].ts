import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  deleteCouponFromDB,
  getCouponByIdFromDB,
  updateCouponFromDB,
} from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withVerifiedAdminAuth } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

interface UpdateCouponRequest {
  code?: string;
  discountPercentage?: number;
  description?: string;
  isActive?: boolean;
  expiryDate?: string;
  maxUsage?: number;
  minimumAmount?: number;
  applicableProducts?: string[];
  showOnPricingBanner?: boolean;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { couponId } = query;

  if (!couponId || typeof couponId !== "string") {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Coupon ID is required",
      }),
    );
  }

  switch (method) {
    case "GET":
      return handleGetCoupon(couponId, res);

    case "PUT":
      return handleUpdateCoupon(req, res, couponId);

    case "DELETE":
      return handleDeleteCoupon(couponId, res);

    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${method} not allowed`,
        }),
      );
  }
};

// GET - Get specific coupon (admin only)
const handleGetCoupon = async (couponId: string, res: NextApiResponse) => {
  try {
    const { data: coupon, error } = await getCouponByIdFromDB(couponId);

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
        message: "Coupon fetched successfully",
        data: coupon,
      }),
    );
  } catch (error) {
    logger.error("Error fetching coupon", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal server error while fetching coupon",
      }),
    );
  }
};

// PUT - Update existing coupon (admin only)
const handleUpdateCoupon = async (
  req: NextApiRequest,
  res: NextApiResponse,
  couponId: string,
) => {
  try {
    const updateData: UpdateCouponRequest = req.body;

    // Validate discount percentage if provided
    if (updateData.discountPercentage != null) {
      if (
        updateData.discountPercentage < 1 ||
        updateData.discountPercentage > 100
      ) {
        return res.status(apiStatusCodes.BAD_REQUEST).json(
          sendAPIResponse({
            status: false,
            message: "Discount percentage must be between 1 and 100",
          }),
        );
      }
    }

    // Convert expiryDate to Date object if provided
    const { expiryDate, code, description, ...otherUpdateData } = updateData;
    const processedUpdateData = {
      ...otherUpdateData,
      ...(expiryDate && { expiryDate: new Date(expiryDate) }),
      ...(code && { code: code.trim() }),
      ...(description && { description: description.trim() }),
    };

    const { data: updatedCoupon, error } = await updateCouponFromDB(
      couponId,
      processedUpdateData,
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
        message: "Coupon updated successfully",
        data: updatedCoupon,
      }),
    );
  } catch (error) {
    logger.error("Error updating coupon", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal server error while updating coupon",
      }),
    );
  }
};

// DELETE - Delete coupon (admin only)
const handleDeleteCoupon = async (couponId: string, res: NextApiResponse) => {
  try {
    const { data: deletedCoupon, error } = await deleteCouponFromDB(couponId);

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
        message: "Coupon deleted successfully",
        data: deletedCoupon,
      }),
    );
  } catch (error) {
    logger.error("Error deleting coupon", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal server error while deleting coupon",
      }),
    );
  }
};

export default withApiHandler(withVerifiedAdminAuth(handler));
