import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { getPaymentByOrderIdFromDB } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

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

    const ownerId =
      typeof payment.user === "object" && payment.user !== null
        ? String((payment.user as { _id?: unknown })._id ?? payment.user)
        : String(payment.user);

    if (ownerId !== String(userId)) {
      return res.status(apiStatusCodes.FORBIDDEN).json(
        sendAPIResponse({
          status: false,
          message: "Forbidden",
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Payment found",
        data: {
          orderId: payment.orderId,
          paymentStatus: payment.status,
          productType: payment.productType,
          productId: payment.productId,
          amount: payment.amount,
        },
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal Server Error",
      }),
    );
  }
};

export default withApiHandler(handler);
