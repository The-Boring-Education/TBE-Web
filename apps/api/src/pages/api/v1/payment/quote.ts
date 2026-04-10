import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes, isDevelopmentEnv } from "@/lib/constants";
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
      productType: typeof q.productType === "string" ? q.productType : undefined,
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
