import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes, envConfig, isDevelopmentEnv } from "@/lib/constants";
import { addPaymentToDB } from "@/lib/database";
import {
  buildOrderPayload,
  createCashfreeOrder,
  generatePaymentOrderId,
  sendAPIResponse,
} from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "POST":
        return await handleCreateOrder(req, res);
      default:
        return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
          sendAPIResponse({
            status: false,
            message: `Method ${req.method} Not Allowed`,
          }),
        );
    }
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal Server Error",
        error,
      }),
    );
  }
};

const handleCreateOrder = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      userId,
      productId,
      productType,
      amount,
      customerName,
      customerEmail,
      appliedCoupon,
      couponCode,
    } = req.body;

    if (
      !userId ||
      !productId ||
      !productType ||
      !amount ||
      !customerName ||
      !customerEmail
    ) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Missing required fields",
        }),
      );
    }

    const orderId = generatePaymentOrderId();

    const orderPayload = buildOrderPayload({
      orderId,
      amount,
      userId,
      customerName,
      customerEmail,
    });

    const { data, ok } = await createCashfreeOrder(orderPayload);

    if (!ok || !data.payment_session_id) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Failed to create order with payment gateway",
          error: isDevelopmentEnv && data,
        }),
      );
    }

    const paymentLink = `${envConfig.CASHFREE_BASE_URL}/checkout?paymentSessionId=${data.payment_session_id}`;

    const { error } = await addPaymentToDB({
      userId,
      productId,
      productType,
      amount,
      orderId,
      paymentLink,
      appliedCoupon,
      couponCode,
    });

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: error,
        }),
      );
    }

    // 13. Send success response
    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Order created successfully",
        data: {
          orderId,
          paymentLink,
          paymentSessionId: data.payment_session_id,
        },
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal Server Error",
        error: isDevelopmentEnv && error,
      }),
    );
  }
};

export default withApiHandler(handler);
