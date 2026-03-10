import type {
  AddPaymentToDBRequestPayloadProps,
  DatabaseQueryResponseType,
  UpdatePaymentStatusPayloadProps,
} from "@/lib/interfaces";

import { Payment, PrepYatraSubscription } from "../models";

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
      isPaid: false,
      ...(appliedCoupon && { appliedCoupon }),
      ...(couponCode && { couponCode }),
    });

    await payment.save();
    return { data: payment };
  } catch (error) {
    return { error: "Failed to save payment to DB" };
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
    return { error: "Failed to find payment" };
  }
};

const updatePaymentStatusToDB = async ({
  orderId,
  paymentId,
  status,
}: UpdatePaymentStatusPayloadProps): Promise<DatabaseQueryResponseType> => {
  try {
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return { error: "Payment not found" };
    }

    payment.isPaid = status === "SUCCESS";
    if (paymentId) {
      payment.paymentId = paymentId;
    }

    await payment.save();
    return { data: payment };
  } catch (error: any) {
    return { error: `Failed to update payment status: ${error.message}` };
  }
};

const checkPaymentStatusFromDB = async (
  userId: string,
  productId: string,
  productType?: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    // Step 1: Check if user has active PrepYatra subscription
    // PrepYatra subscribers get access to all products
    const activeSubscription = await PrepYatraSubscription.findOne({
      userId,
      isActive: true,
    });

    if (activeSubscription) {
      return {
        data: {
          purchased: true,
          accessType: "PREPYATRA_SUBSCRIPTION",
        },
      };
    }

    // Step 2: Check specific payment for this product
    // This works for all product types: INTERVIEW_SHEET, SHIKSHA, PROJECTS, etc.
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

    if (payment.isPaid) {
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
    return { error: "Error checking payment status" };
  }
};

export {
  addPaymentToDB,
  checkPaymentStatusFromDB,
  getPaymentByOrderIdFromDB,
  updatePaymentStatusToDB,
};
