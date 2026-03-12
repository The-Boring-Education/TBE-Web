import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { migrateExistingAptitudeData } from "@/lib/database";
import { cors, sendAPIResponse } from "@/lib/utils";
import { connectDB } from "@/middleware/api";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);
  await connectDB();

  if (req.method !== "POST") {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} Not Allowed`,
      }),
    );
  }

  const adminSecret = req.headers["x-admin-secret"];
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res
      .status(apiStatusCodes.UNAUTHORIZED)
      .json(sendAPIResponse({ status: false, message: "Unauthorized" }));
  }

  const { data, error } = await migrateExistingAptitudeData();

  if (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Migration failed",
        error,
      }),
    );
  }

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data,
      message: "Aptitude data migration successful",
    }),
  );
};

export default handler;
