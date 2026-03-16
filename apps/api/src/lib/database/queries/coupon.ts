import type { DatabaseQueryResponseType } from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import Coupon from "../models/Coupon";

const findCouponByCodeFromDB = async (
  code: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return { error: "Coupon not found" };
    }
    return { data: coupon };
  } catch (error) {
    logger.error("DB: findCouponByCodeFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to find coupon", details: error };
  }
};

const validateCouponForProductFromDB = async (
  code: string,
  productId: string,
  productType: string,
  userId?: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return { error: "Coupon not found" };
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return { error: "Coupon is inactive" };
    }

    // Check if coupon is expired
    if (coupon.isExpired) {
      return { error: "Coupon has expired" };
    }

    // Check if usage limit is reached
    if (coupon.isUsageLimitReached) {
      return { error: "Coupon usage limit reached" };
    }

    // Check if applicable to this product (empty array means all products)
    if (
      coupon.applicableProducts.length > 0 &&
      !coupon.applicableProducts.includes(productId)
    ) {
      return { error: "Coupon not applicable to this product" };
    }

    return { data: coupon };
  } catch (error) {
    logger.error("DB: validateCouponForProductFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to validate coupon", details: error };
  }
};

const getCouponByIdFromDB = async (
  couponId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return { error: "Coupon not found" };
    }
    return { data: coupon };
  } catch (error) {
    logger.error("DB: getCouponByIdFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to get coupon", details: error };
  }
};

// ==== ADMIN FUNCTIONS ====

const getAllCouponsFromDB = async (): Promise<DatabaseQueryResponseType> => {
  try {
    const coupons = await Coupon.find({})
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    return { data: coupons };
  } catch (error) {
    logger.error("DB: getAllCouponsFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to fetch coupons", details: error };
  }
};

const createCouponFromDB = async (couponData: {
  code: string;
  discountPercentage: number;
  description: string;
  isActive: boolean;
  expiryDate: Date;
  maxUsage?: number;
  minimumAmount: number;
  applicableProducts?: string[];
  createdBy: string;
}): Promise<DatabaseQueryResponseType> => {
  try {
    // Check if coupon with same code already exists
    const existingCoupon = await Coupon.findOne({
      code: couponData.code.toUpperCase(),
    });

    if (existingCoupon) {
      return { error: "Coupon with this code already exists" };
    }

    // Validate expiry date is in the future
    if (new Date(couponData.expiryDate) <= new Date()) {
      return { error: "Expiry date must be in the future" };
    }

    const newCoupon = new Coupon({
      ...couponData,
      code: couponData.code.toUpperCase(),
    });

    const savedCoupon = await newCoupon.save();
    await savedCoupon.populate("createdBy", "name email");

    return { data: savedCoupon };
  } catch (error) {
    logger.error("DB: createCouponFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Handle Mongoose validation errors
    if (
      error instanceof Error &&
      "name" in error &&
      error.name === "ValidationError"
    ) {
      const messages = Object.values((error as any).errors).map(
        (err: any) => err.message,
      );
      return { error: messages.join(", "), details: error };
    }

    // Handle duplicate key error
    if (
      error instanceof Error &&
      "code" in error &&
      (error as any).code === 11000
    ) {
      return { error: "Coupon with this code already exists", details: error };
    }

    return { error: "Failed to create coupon", details: error };
  }
};

const updateCouponFromDB = async (
  couponId: string,
  updateData: {
    code?: string;
    discountPercentage?: number;
    description?: string;
    isActive?: boolean;
    expiryDate?: Date;
    maxUsage?: number;
    minimumAmount?: number;
    applicableProducts?: string[];
  },
): Promise<DatabaseQueryResponseType> => {
  try {
    // Check if coupon exists
    const existingCoupon = await Coupon.findById(couponId);
    if (!existingCoupon) {
      return { error: "Coupon not found" };
    }

    // If updating code, check for duplicates (exclude current coupon)
    if (updateData.code) {
      const codeExists = await Coupon.findOne({
        code: updateData.code.toUpperCase(),
        _id: { $ne: couponId },
      });

      if (codeExists) {
        return { error: "Coupon with this code already exists" };
      }

      updateData.code = updateData.code.toUpperCase();
    }

    // Validate expiry date if provided
    if (
      updateData.expiryDate &&
      new Date(updateData.expiryDate) <= new Date()
    ) {
      return { error: "Expiry date must be in the future" };
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, updateData, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email");

    if (!updatedCoupon) {
      return { error: "Failed to update coupon" };
    }

    return { data: updatedCoupon };
  } catch (error) {
    logger.error("DB: updateCouponFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Handle Mongoose validation errors
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      (error as { name: string }).name === "ValidationError"
    ) {
      const messages = Object.values(
        (error as unknown as { errors: Record<string, { message: string }> })
          .errors,
      ).map((err) => err.message);
      return { error: messages.join(", "), details: error };
    }

    // Handle duplicate key error
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return { error: "Coupon with this code already exists", details: error };
    }

    return { error: "Failed to update coupon", details: error };
  }
};

const deleteCouponFromDB = async (
  couponId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(couponId);

    if (!deletedCoupon) {
      return { error: "Coupon not found" };
    }

    return { data: deletedCoupon };
  } catch (error) {
    logger.error("DB: deleteCouponFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to delete coupon", details: error };
  }
};

const applyCouponToSheetsFromDB = async (
  couponId: string,
  sheetIds: string[],
): Promise<DatabaseQueryResponseType> => {
  try {
    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      return { error: "Coupon not found" };
    }

    // Add new sheet IDs to applicable products, avoiding duplicates
    const uniqueSheetIds = Array.from(
      new Set(
        (Array.isArray(coupon.applicableProducts)
          ? coupon.applicableProducts
          : []
        ).concat(sheetIds),
      ),
    );

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      { applicableProducts: uniqueSheetIds },
      { new: true },
    ).populate("createdBy", "name email");

    return { data: updatedCoupon };
  } catch (error) {
    logger.error("DB: applyCouponToSheetsFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to apply coupon to sheets", details: error };
  }
};

const removeCouponFromSheetFromDB = async (
  couponId: string,
  sheetId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      return { error: "Coupon not found" };
    }

    const updatedProducts = coupon.applicableProducts.filter(
      (productId: string) => productId !== sheetId,
    );

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      { applicableProducts: updatedProducts },
      { new: true },
    ).populate("createdBy", "name email");

    return { data: updatedCoupon };
  } catch (error) {
    logger.error("DB: removeCouponFromSheetFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to remove coupon from sheet", details: error };
  }
};

const incrementCouponUsageFromDB = async (
  couponId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      { $inc: { currentUsage: 1 } },
      { new: true },
    );

    if (!updatedCoupon) {
      return { error: "Coupon not found" };
    }

    return { data: updatedCoupon };
  } catch (error) {
    logger.error("DB: incrementCouponUsageFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to increment coupon usage", details: error };
  }
};

export {
  applyCouponToSheetsFromDB,
  createCouponFromDB,
  deleteCouponFromDB,
  // Public functions
  findCouponByCodeFromDB,
  // Admin functions
  getAllCouponsFromDB,
  getCouponByIdFromDB,
  incrementCouponUsageFromDB,
  removeCouponFromSheetFromDB,
  updateCouponFromDB,
  validateCouponForProductFromDB,
};
