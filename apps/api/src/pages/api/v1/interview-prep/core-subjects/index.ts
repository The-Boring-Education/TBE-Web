import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  checkPaymentStatusFromDB,
  getCoreSubjectsFromDB,
} from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} Not Allowed`,
      }),
    );
  }

  const { userId } = req.query;
  const isPaidUser =
    typeof userId === "string"
      ? (await checkPaymentStatusFromDB(userId, "oncampus", "ONCAMPUS")).data
          ?.purchased === true
      : false;

  const { data, error } = await getCoreSubjectsFromDB(isPaidUser);

  if (error || !data) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to fetch core subjects",
        error,
      }),
    );
  }

  return res
    .status(apiStatusCodes.OKAY)
    .json(sendAPIResponse({ status: true, data }));
};

export default withApiHandler(handler);
