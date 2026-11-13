import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { reorderContentInDB } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { captureAPIError } from "@/lib/utils/sentry";
import {
  contentOrderSchema,
  contentOrderValidationMessage,
} from "@/lib/validation/contentOrder";
import { withApiHandler } from "@/middleware/requestLogger";

const handlePatchContentOrder = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const validation = contentOrderSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: contentOrderValidationMessage(validation.error),
      }),
    );
  }

  const { data, error, statusCode } = await reorderContentInDB(validation.data);
  if (error !== undefined) {
    captureAPIError(
      new Error(error),
      "/api/v1/admin/content-order",
      "PATCH",
      statusCode,
      { parentId: validation.data.parentId },
    );
    return res
      .status(statusCode)
      .json(sendAPIResponse({ status: false, message: error }));
  }

  return res
    .status(apiStatusCodes.OKAY)
    .json(
      sendAPIResponse({ status: true, data, message: "Content order saved" }),
    );
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "PATCH":
      return handlePatchContentOrder(req, res);
    default:
      return res
        .status(apiStatusCodes.METHOD_NOT_ALLOWED)
        .json(
          sendAPIResponse({ status: false, message: "Method not allowed" }),
        );
  }
};

export default withApiHandler(handler, { admin: {} });
