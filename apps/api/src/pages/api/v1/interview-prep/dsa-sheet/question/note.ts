import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { saveDSAQuestionNote } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} Not Allowed`,
      }),
    );
  }

  const { userId, questionId, notes, sheetId } = req.body;

  if (!userId || !questionId || notes === undefined) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Required: userId, questionId, notes",
      }),
    );
  }

  const { data, error } = await saveDSAQuestionNote(
    userId,
    questionId,
    notes,
    sheetId,
  );

  if (error) {
    return res
      .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        sendAPIResponse({
          status: false,
          message: "Failed to save note",
          error,
        }),
      );
  }

  return res
    .status(apiStatusCodes.OKAY)
    .json(sendAPIResponse({ status: true, data, message: "Note saved" }));
};

export default withApiHandler(handler);
