import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { apiStatusCodes, envConfig, isDevelopmentEnv } from "@/lib/constants";
import type { ProductType } from "@/lib/constants/database";
import { isValidProductType } from "@/lib/constants/products";
import { addPaymentToDB } from "@/lib/database";
import { resolveAuthoritativeOrderAmount } from "@/lib/services/payment";
import {
  buildOrderPayload,
  createCashfreeOrder,
  generatePaymentOrderId,
  sendAPIResponse,
} from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

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
    const session = await getServerSession(req, res, authOptions);
    const sessionUser = session?.user as { id?: string } | undefined;
    if (!session || !sessionUser?.id) {
      return res.status(apiStatusCodes.UNAUTHORIZED).json(
        sendAPIResponse({
          status: false,
          message: "Authentication required",
        }),
      );
    }

    const {
      userId,
      productId,
      productType,
      customerName,
      customerEmail,
      couponCode,
    } = req.body;

    // Ensure the caller can only create orders for themselves
    if (userId !== sessionUser.id) {
      return res.status(apiStatusCodes.FORBIDDEN).json(
        sendAPIResponse({
          status: false,
          message: "Cannot create an order for another user",
        }),
      );
    }

    if (
      !userId ||
      !productId ||
      !productType ||
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

    if (!isValidProductType(productType)) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Invalid product type: ${productType}`,
        }),
      );
    }

    const resolved = await resolveAuthoritativeOrderAmount({
      productType: productType as ProductType,
      productId,
      couponCode: couponCode ?? undefined,
      userId,
    });

    if (!resolved.ok) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: resolved.error,
        }),
      );
    }

    const {
      finalAmount,
      appliedCoupon,
      couponCode: resolvedCoupon,
    } = resolved.data;

    const orderId = generatePaymentOrderId();

    const orderPayload = buildOrderPayload({
      orderId,
      amount: finalAmount,
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
      amount: finalAmount,
      orderId,
      paymentLink,
      ...(appliedCoupon && { appliedCoupon }),
      ...(resolvedCoupon && { couponCode: resolvedCoupon }),
    });

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: error,
        }),
      );
    }

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
