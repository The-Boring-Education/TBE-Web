import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import type { ProductType } from "@/lib/constants/database";
import { isValidProductType } from "@/lib/constants/products";
import {
  listSubscriptionPlansFromDB,
  upsertSubscriptionPlansInDB,
} from "@/lib/database";
import type { APIResponseType } from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { adminMiddleware } from "@/middleware/api";
import { withApiHandler } from "@/middleware/requestLogger";

interface SeedBody {
  plans: Array<{
    productType: string;
    planKey: string;
    amountInr: number;
    isActive?: boolean;
  }>;
}

const handler = async (req: NextApiRequest, res: NextApiResponse<APIResponseType>) => {
  const adminCheck = await adminMiddleware(req, res);
  if (!adminCheck) return;

  try {
    switch (req.method) {
      case "GET":
        return handleGet(res);
      case "POST":
        return handlePost(req, res);
      default:
        return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
          sendAPIResponse({
            status: false,
            message: `Method ${req.method} Not Allowed`,
          }),
        );
    }
  } catch (error) {
    logger.error("admin subscription-plans handler error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal Server Error",
      }),
    );
  }
};

const handleGet = async (res: NextApiResponse<APIResponseType>) => {
  const { data, error } = await listSubscriptionPlansFromDB();
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
      message: "OK",
      data,
    }),
  );
};

const handlePost = async (
  req: NextApiRequest,
  res: NextApiResponse<APIResponseType>,
) => {
  const body = req.body as SeedBody;
  if (!body?.plans || !Array.isArray(body.plans)) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Body must include plans: [...]",
      }),
    );
  }

  for (const p of body.plans) {
    if (!p.productType || !p.planKey || typeof p.amountInr !== "number") {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Each plan needs productType, planKey, amountInr",
        }),
      );
    }
    if (!isValidProductType(p.productType)) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Invalid productType: ${p.productType}`,
        }),
      );
    }
  }

  const { data, error } = await upsertSubscriptionPlansInDB(
    body.plans.map((p) => ({
      productType: p.productType as ProductType,
      planKey: p.planKey,
      amountInr: p.amountInr,
      isActive: p.isActive,
    })),
  );

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
      message: "Subscription plans upserted",
      data,
    }),
  );
};

export default withApiHandler(handler);
