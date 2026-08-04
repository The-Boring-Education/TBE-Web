import type {
  AddPaymentToDBRequestPayloadProps,
  DatabaseQueryResponseType,
  UpdatePaymentStatusPayloadProps,
} from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import { Payment, Subscription } from "../models";

const addPaymentToDB = async ({
  userId,
  productId,
  productType,
  amount,
  orderId,
  paymentLink,
  appliedCoupon,
  couponCode,
}: AddPaymentToDBRequestPayloadProps): Promise<DatabaseQueryResponseType> => {
  try {
    const payment = new Payment({
      user: userId,
      productId,
      productType,
      amount,
      orderId,
      paymentLink,
      status: "PENDING",
      ...(appliedCoupon && { appliedCoupon }),
      ...(couponCode && { couponCode }),
    });

    await payment.save();
    return { data: payment };
  } catch (error) {
    logger.error("DB: addPaymentToDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to save payment to DB", details: error };
  }
};

const getPaymentByOrderIdFromDB = async (
  orderId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return { error: "Payment not found" };
    }
    return { data: payment };
  } catch (error) {
    logger.error("DB: getPaymentByOrderIdFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to find payment", details: error };
  }
};

const updatePaymentStatusToDB = async ({
  orderId,
  paymentId,
  status,
}: UpdatePaymentStatusPayloadProps): Promise<DatabaseQueryResponseType> => {
  try {
    const updated = await Payment.findOneAndUpdate(
      { orderId },
      {
        status,
        ...(paymentId && { paymentId }),
      },
      { new: true },
    );

    if (!updated) {
      return { error: "Payment not found" };
    }

    return { data: updated };
  } catch (error) {
    logger.error("DB: updatePaymentStatusToDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed to update payment status",
      details: error,
    };
  }
};

const claimPaymentCouponUsageFromDB = async (
  orderId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { orderId, couponUsageApplied: { $ne: true } },
      { $set: { couponUsageApplied: true } },
      { new: true },
    );
    return { data: payment };
  } catch (error) {
    logger.error("DB: claimPaymentCouponUsageFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to claim payment coupon usage", details: error };
  }
};

const markPaymentEnrollmentCompletedInDB = async (
  orderId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { orderId },
      { $set: { enrollmentCompleted: true } },
      { new: true },
    );
    return { data: payment };
  } catch (error) {
    logger.error("DB: markPaymentEnrollmentCompletedInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed to mark payment enrollment completed",
      details: error,
    };
  }
};

const checkPaymentStatusFromDB = async (
  userId: string,
  productId: string,
  productType?: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    // PREPYATRA, DSA_YATRA, and ONCAMPUS all use createSubscription → stored in Subscription.
    // Other product types (INTERVIEW_SHEET, SHIKSHA, etc.) always fall through to Payment.
    if (
      productType === "PREPYATRA" ||
      productType === "DSA_YATRA" ||
      productType === "ONCAMPUS"
    ) {
      const activeSubscription = await Subscription.findOne({
        userId,
        isActive: true,
        // Match either the exact productType or legacy rows (no productType stored)
        // that were created before product-scoping was added (originally all were PrepYatra).
        $or: [
          { productType },
          ...(productType === "PREPYATRA"
            ? [{ productType: { $exists: false } }]
            : []),
        ],
      });

      if (activeSubscription) {
        return {
          data: {
            purchased: true,
            accessType: "SUBSCRIPTION",
          },
        };
      }
    }

    const payment = await Payment.findOne({
      user: userId,
      productId,
      ...(productType && { productType }),
    });

    if (!payment) {
      return {
        data: { purchased: false },
        error: "No payment record found",
      };
    }

    if (payment.status === "SUCCESS") {
      return {
        data: {
          purchased: true,
          accessType: "DIRECT_PAYMENT",
        },
      };
    } else {
      return {
        data: { purchased: false },
        error: "Payment not completed",
      };
    }
  } catch (error) {
    logger.error("DB: checkPaymentStatusFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed to check payment status",
      details: error,
    };
  }
};

export {
  addPaymentToDB,
  checkPaymentStatusFromDB,
  claimPaymentCouponUsageFromDB,
  getPaymentByOrderIdFromDB,
  markPaymentEnrollmentCompletedInDB,
  updatePaymentStatusToDB,
};
