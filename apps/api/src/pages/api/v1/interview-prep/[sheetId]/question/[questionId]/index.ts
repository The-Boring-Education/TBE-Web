import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  deleteQuestionFromSheetInDB,
  updateInterviewQuestionInDB,
} from "@/lib/database";
import type { AddInterviewQuestionRequestPayloadProps } from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils";
import { adminMiddleware } from "@/middleware/api";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { sheetId, questionId } = query as {
    questionId: string;
    sheetId: string;
  };

  switch (method) {
    case "PATCH":
      const isAdminPatch = await adminMiddleware(req, res);
      if (!isAdminPatch) return;
      return handleUpdateQuestion(req, res, sheetId, questionId);
    case "DELETE":
      const isAdminDelete = await adminMiddleware(req, res);
      if (!isAdminDelete) return;
      return handleDeleteQuestion(req, res, sheetId, questionId);

    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        }),
      );
  }
};

const handleUpdateQuestion = async (
  req: NextApiRequest,
  res: NextApiResponse,
  sheetId: string,
  questionId: string,
) => {
  const updatedData =
    req.body as Partial<AddInterviewQuestionRequestPayloadProps>;

  try {
    const { data, error } = await updateInterviewQuestionInDB(
      sheetId,
      questionId,
      updatedData,
    );

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed while updating chapter to section",
        }),
      );
    }

    return res
      .status(apiStatusCodes.OKAY)
      .json(sendAPIResponse({ status: true, data }));
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed while updating chapter to section",
      }),
    );
  }
};

const handleDeleteQuestion = async (
  req: NextApiRequest,
  res: NextApiResponse,
  sheetId: string,
  questionId: string,
) => {
  try {
    const { data, error } = await deleteQuestionFromSheetInDB(
      sheetId,
      questionId,
    );

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed while deleting question from sheet",
        }),
      );
    }

    return res
      .status(apiStatusCodes.OKAY)
      .json(sendAPIResponse({ status: true, data }));
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed while deleting question from sheet",
      }),
    );
  }
};

export default withApiHandler(handler);
