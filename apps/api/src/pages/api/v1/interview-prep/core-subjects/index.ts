import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { getCoreSubjectsFromDB } from "@/lib/database";
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

  const { data, error } = await getCoreSubjectsFromDB();

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
