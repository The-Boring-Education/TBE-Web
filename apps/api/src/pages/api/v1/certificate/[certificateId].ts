import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { getCertificateById } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { connectDB } from "@/middleware/api";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  const { method, query } = req;
  const { certificateId } = query as {
    certificateId: string;
  };

  switch (method) {
    case "GET":
      return handleGetACertificate(req, res, certificateId);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        }),
      );
  }
};

const handleGetACertificate = async (
  req: NextApiRequest,
  res: NextApiResponse,
  certificateId: string,
) => {
  try {
    if (!certificateId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Certificate ID is required",
        }),
      );
    }

    const { data } = await getCertificateById(certificateId);

    if (data) {
      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          data,
        }),
      );
    }

    return res.status(apiStatusCodes.NOT_FOUND).json(
      sendAPIResponse({
        status: false,
        message: "Certificate not found",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed while fetching Certificate",
        error: true,
      }),
    );
  }
};

export default handler;
