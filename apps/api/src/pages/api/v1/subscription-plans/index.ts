import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { isValidProductType } from "@/lib/constants/products";
import { listSubscriptionPlansFromDB } from "@/lib/database";
import type { APIResponseType } from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<APIResponseType>,
) => {
  if (req.method !== "GET") {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} Not Allowed`,
      }),
    );
  }

  const productType =
    typeof req.query.productType === "string"
      ? req.query.productType
      : undefined;

  if (productType && !isValidProductType(productType)) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: `Invalid product type: ${productType}`,
      }),
    );
  }

  const { data, error } = await listSubscriptionPlansFromDB();

  if (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: error,
      }),
    );
  }

  const plans = Array.isArray(data) ? data : [];
  const filteredPlans = plans.filter(
    (plan) =>
      plan.isActive === true &&
      (!productType || plan.productType === productType),
  );

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      message: "OK",
      data: filteredPlans,
    }),
  );
};

export default withApiHandler(handler);
