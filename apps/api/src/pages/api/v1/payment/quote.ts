import type { NextApiRequest, NextApiResponse } from "next";

import { verifyToken } from "@/lib/auth/jwt";
import { apiStatusCodes } from "@/lib/constants";
import type { ProductType } from "@/lib/constants/database";
import { isValidProductType } from "@/lib/constants/products";
import { resolveAuthoritativeOrderAmount } from "@/lib/services/payment";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

const parseQuoteInput = (
  req: NextApiRequest,
): {
  productType?: string;
  productId?: string;
  couponCode?: string;
  userId?: string;
} => {
  if (req.method === "GET") {
    const q = req.query;
    return {
      productType:
        typeof q.productType === "string" ? q.productType : undefined,
      productId: typeof q.productId === "string" ? q.productId : undefined,
      couponCode: typeof q.coupon === "string" ? q.coupon : undefined,
      userId: typeof q.userId === "string" ? q.userId : undefined,
    };
  }
  const b = req.body || {};
  return {
    productType: b.productType,
    productId: b.productId,
    couponCode: b.couponCode ?? b.coupon,
    userId: b.userId,
  };
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== "GET" && req.method !== "POST") {
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        }),
      );
    }

    // Extract Bearer token from Authorization header (sent by platform via proxy)
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    let sessionUserId: string | undefined;
    if (token) {
      try {
        const payload = verifyToken<{ sub?: string }>(token);
        sessionUserId = payload?.sub;
      } catch {
        // Token invalid or expired — skip auth validation
      }
    }

    const { productType, productId, couponCode, userId } = parseQuoteInput(req);

    if (!productType || !productId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "productType and productId are required",
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

    // If userId is provided, require a valid token that matches
    if (userId) {
      if (!sessionUserId) {
        return res.status(apiStatusCodes.UNAUTHORIZED).json(
          sendAPIResponse({
            status: false,
            message: "Authentication required when userId is specified",
          }),
        );
      }
      if (userId !== sessionUserId) {
        return res.status(apiStatusCodes.FORBIDDEN).json(
          sendAPIResponse({
            status: false,
            message: "Cannot fetch a quote for another user",
          }),
        );
      }
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

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Quote ready",
        data: resolved.data,
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
