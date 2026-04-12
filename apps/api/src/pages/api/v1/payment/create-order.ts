import type { NextApiRequest, NextApiResponse } from "next";

import type { AccessTokenPayload } from "@/lib/auth/jwt";
import { verifyToken } from "@/lib/auth/jwt";
import { apiStatusCodes, isDevelopmentEnv } from "@/lib/constants";
import type { ProductType } from "@/lib/constants/database";
import { isValidProductType } from "@/lib/constants/products";
import { addPaymentToDB } from "@/lib/database";
import { resolveAuthoritativeOrderAmount } from "@/lib/services/payment";
import {
  buildCashfreeHostedCheckoutLink,
  buildOrderPayload,
  createCashfreeOrder,
  generatePaymentOrderId,
  sendAPIResponse,
} from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

/**
 * Only `Authorization: Bearer` access JWT (`tbe_access_token`).
 * Do not use `getServerSession` here: forwarded NextAuth cookies hit this API on a
 * different host/secret and trigger `JWEDecryptionFailed` / noisy session errors.
 * Platform checkout already sends Bearer via `getAccessToken()`.
 */
const getAuthorizationHeader = (req: NextApiRequest): string | undefined => {
  const raw = req.headers.authorization as string | string[] | undefined;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw) && raw.length > 0) return raw[0];
  return undefined;
};

const getAuthenticatedUserIdFromBearer = (
  req: NextApiRequest,
): string | null => {
  const authHeader = getAuthorizationHeader(req);
  const raw = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!raw) return null;

  try {
    const payload = verifyToken<AccessTokenPayload>(raw);
    if (payload.type === "access" && payload.sub) {
      return payload.sub;
    }
  } catch {
    return null;
  }
  return null;
};

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
    const authenticatedUserId = getAuthenticatedUserIdFromBearer(req);
    if (!authenticatedUserId) {
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
    if (userId !== authenticatedUserId) {
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

    const { data, ok, gatewayMessage, httpStatus } =
      await createCashfreeOrder(orderPayload);

    const paymentSessionId =
      data &&
      typeof data === "object" &&
      "payment_session_id" in data &&
      typeof (data as { payment_session_id: unknown }).payment_session_id ===
        "string"
        ? (data as { payment_session_id: string }).payment_session_id
        : undefined;

    if (!ok || !paymentSessionId) {
      const base = "Failed to create order with payment gateway";
      const message = gatewayMessage
        ? `${base}: ${gatewayMessage}`
        : `${base} (HTTP ${httpStatus})`;
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message,
          error: isDevelopmentEnv ? data : undefined,
        }),
      );
    }

    const paymentLink = buildCashfreeHostedCheckoutLink(paymentSessionId);

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
          paymentSessionId,
        },
      }),
    );
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "";
    const isPlatformUrlConfig = errMsg.includes("NEXT_PUBLIC_PLATFORM_URL");
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: isPlatformUrlConfig ? errMsg : "Internal Server Error",
        error: isDevelopmentEnv ? error : undefined,
      }),
    );
  }
};

export default withApiHandler(handler);
