import type { NextApiRequest, NextApiResponse } from "next";

import { sendAPIResponse } from "@/lib/utils";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json(
      sendAPIResponse({
        status: false,
        message: "Method not allowed",
      }),
    );
  }

  return res.status(200).json(
    sendAPIResponse({
      status: true,
      message: "Logged out successfully",
    }),
  );
};

export default handler;
