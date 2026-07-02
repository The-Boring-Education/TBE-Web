import type { NextApiRequest, NextApiResponse } from "next";

import {
  fetchActivationAnalytics,
  fetchMauAnalytics,
  fetchRetentionAnalytics,
  Ga4NotConfiguredError,
} from "@/lib/analytics/ga4Client";
import { apiStatusCodes } from "@/lib/constants";
import { sendAPIResponse } from "@/lib/utils";
import { withVerifiedAdminAuth } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

const VALID_TYPES = new Set(["mau", "activation", "retention"]);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} not allowed`,
      }),
    );
  }

  const type = (req.query.type as string) || "mau";
  const period = (req.query.period as string) || "30d";

  if (!VALID_TYPES.has(type)) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: `Invalid type. Expected one of: mau, activation, retention`,
      }),
    );
  }

  try {
    let data: unknown;

    switch (type) {
      case "mau":
        data = await fetchMauAnalytics(period);
        break;
      case "activation":
        data = await fetchActivationAnalytics(period);
        break;
      case "retention":
        data = await fetchRetentionAnalytics(period);
        break;
      default:
        data = null;
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
      }),
    );
  } catch (error) {
    if (error instanceof Ga4NotConfiguredError) {
      return res.status(503).json(
        sendAPIResponse({
          status: false,
          message:
            "GA4 analytics is not configured. Set GA4_PROPERTY_ID and GA4_SERVICE_ACCOUNT_JSON.",
        }),
      );
    }

    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch growth analytics",
      }),
    );
  }
};

export default withApiHandler(withVerifiedAdminAuth(handler));
