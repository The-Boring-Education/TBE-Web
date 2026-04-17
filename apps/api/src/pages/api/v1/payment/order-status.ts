import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  getPaymentByOrderIdFromDB,
  updatePaymentStatusToDB,
} from "@/lib/database";
import type { PaymentModel } from "@/lib/interfaces";
import { processPostPaymentEnrollment } from "@/lib/services/payment";
import { fetchCashfreeOrderByOrderId, sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withApiHandler } from "@/middleware/requestLogger";

const resolvePaymentOwnerId = (payment: PaymentModel): string => {
  if (typeof payment.user === "object" && payment.user !== null) {
    return String((payment.user as { _id?: unknown })._id ?? payment.user);
  }
  return String(payment.user);
};

const mapCashfreeOrderStatus = (
  status: string | undefined,
): "SUCCESS" | "FAILED" | null => {
  if (status === "PAID") return "SUCCESS";
  if (status === "EXPIRED") return "FAILED";
  return null;
};

const syncPaymentStatusIfPending = async (
  payment: PaymentModel,
): Promise<PaymentModel> => {
  if (payment.status !== "PENDING") {
    return payment;
  }

  const cf = await fetchCashfreeOrderByOrderId(payment.orderId);
  const mappedStatus = cf.ok ? mapCashfreeOrderStatus(cf.order_status) : null;

  if (!mappedStatus) {
    if (!cf.ok && cf.httpStatus > 0) {
      logger.warn("order-status: Cashfree order fetch failed", {
        orderId: payment.orderId,
        httpStatus: cf.httpStatus,
      });
    }
    return payment;
  }

  const { data: updated, error } = await updatePaymentStatusToDB({
    orderId: payment.orderId,
    paymentId: payment.paymentId,
    status: mappedStatus,
  });

  if (error || !updated) {
    logger.warn("order-status: failed to update payment status", {
      orderId: payment.orderId,
      error,
    });
    return payment;
  }

  const updatedPayment = updated as PaymentModel;

  if (mappedStatus === "SUCCESS") {
    const enrollmentResult = await processPostPaymentEnrollment(updatedPayment);
    if (!enrollmentResult.success) {
      logger.error("order-status: post-payment enrollment failed", {
        orderId: payment.orderId,
        error: enrollmentResult.error,
      });
    }
  }

  return updatedPayment;
};

/**
 * Lookup payment state by Cashfree return `order_id`.
 * Requires userId so a leaked order id cannot be queried anonymously.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== "GET") {
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        }),
      );
    }

    const { orderId, userId } = req.query;

    if (!orderId || !userId || typeof orderId !== "string") {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "orderId and userId are required",
        }),
      );
    }

    const { data: payment, error } = await getPaymentByOrderIdFromDB(orderId);

    if (error || !payment) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: error || "Payment not found",
        }),
      );
    }

    const paymentDoc = payment as PaymentModel;
    const ownerId = resolvePaymentOwnerId(paymentDoc);

    if (ownerId !== String(userId)) {
      return res.status(apiStatusCodes.FORBIDDEN).json(
        sendAPIResponse({
          status: false,
          message: "Forbidden",
        }),
      );
    }

    const syncedPayment = await syncPaymentStatusIfPending(paymentDoc);

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Payment found",
        data: {
          orderId: syncedPayment.orderId,
          paymentStatus: syncedPayment.status,
          productType: syncedPayment.productType,
          productId: syncedPayment.productId,
          amount: syncedPayment.amount,
        },
      }),
    );
  } catch {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal Server Error",
      }),
    );
  }
};

export default withApiHandler(handler);
