import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { checkPaymentStatusFromDB } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "GET":
        return checkPaymentStatus(req, res);
      default:
        return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
          sendAPIResponse({
            status: false,
            message: `Method ${req.method} Not Allowed`,
          }),
        );
    }
  } catch {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal Server Error",
      }),
    );
  }
};

const checkPaymentStatus = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { userId, productId, productType } = req.query;

  if (!userId || !productId) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "userId and productId are required",
      }),
    );
  }

  // productType is optional - if provided, it helps filter payments more accurately
  // Works for all product types: INTERVIEW_SHEET, SHIKSHA, PROJECTS, PREPYATRA, GENERAL
  const { data, error } = await checkPaymentStatusFromDB(
    userId as string,
    productId as string,
    productType as string | undefined,
  );

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: data?.purchased || false,
      data,
      message:
        error ||
        (data?.purchased ? "Payment completed" : "Payment not completed"),
    }),
  );
};

export default withApiHandler(handler);
