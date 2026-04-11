import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes, isDevelopmentEnv } from "@/lib/constants";
import { listSubscriptionPlansFromDB } from "@/lib/database";
import type { APIResponseType } from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<APIResponseType>,
) => {
  try {
    if (req.method !== "GET") {
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        }),
      );
    }

    const { productType } = req.query;

    const { data, error } = await listSubscriptionPlansFromDB();

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: error,
        }),
      );
    }

    // Filter by productType if provided
    let plans = data ?? [];
    if (typeof productType === "string" && productType) {
      plans = plans.filter(
        (p: { productType: string; isActive: boolean }) =>
          p.productType === productType && p.isActive,
      );
    } else {
      plans = plans.filter((p: { isActive: boolean }) => p.isActive === true);
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "OK",
        data: plans,
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
