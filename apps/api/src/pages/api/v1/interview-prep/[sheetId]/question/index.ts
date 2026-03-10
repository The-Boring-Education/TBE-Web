import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { addQuestionToInterviewSheetInDB } from "@/lib/database";
import type { AddInterviewQuestionRequestPayloadProps } from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils";
import { connectDB } from "@/middleware/api";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  const { method, query } = req;
  const { sheetId } = query as { sheetId: string };

  switch (method) {
    case "POST":
      return handleAddQuestion(req, res, sheetId);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        }),
      );
  }
};

const handleAddQuestion = async (
  req: NextApiRequest,
  res: NextApiResponse,
  sheetId: string,
) => {
  const questionData = req.body as AddInterviewQuestionRequestPayloadProps;

  // Validate required fields
  const requiredFields = ["title", "question", "answer"];
  const missingFields = requiredFields.filter(
    (field) =>
      !questionData[field as keyof AddInterviewQuestionRequestPayloadProps],
  );

  if (missingFields.length > 0) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      }),
    );
  }

  try {
    const { data, error } = await addQuestionToInterviewSheetInDB(
      sheetId,
      questionData,
    );

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed while adding question to interview sheet",
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: "Question added to interview sheet successfully",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed while adding question to interview sheet",
      }),
    );
  }
};

export default handler;
