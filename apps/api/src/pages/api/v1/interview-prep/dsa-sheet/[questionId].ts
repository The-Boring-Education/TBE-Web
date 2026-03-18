import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  getDSAQuestionByIDFromDB,
  updateDSAQuestionInDB,
} from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { adminMiddleware } from "@/middleware/api";
import { withApiHandler } from "@/middleware/requestLogger";

/**
 * PATCH /api/v1/interview-prep/dsa-sheet/[questionId]
 * Update a DSA question (e.g. adding structured sections)
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { questionId } = query as { questionId: string };

  if (method === "GET") {
    try {
      const { data, error } = await getDSAQuestionByIDFromDB(questionId);
      if (error) {
        return res
          .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
          .json(
            sendAPIResponse({
              status: false,
              message: "Failed to fetch DSA question",
              error,
            }),
          );
      }
      return res
        .status(apiStatusCodes.OKAY)
        .json(sendAPIResponse({ status: true, data }));
    } catch (error: any) {
      return res
        .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
        .json(sendAPIResponse({ status: false, message: error.message }));
    }
  }

  if (method !== "PATCH") {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: `Method ${method} Not Allowed`,
      }),
    );
  }

  // Admin access required for updates
  const isAdmin = await adminMiddleware(req, res);
  if (!isAdmin) return;

  try {
    const updatedData = req.body;

    console.log("----- PATCH REQUEST RECEIVED FOR:", questionId, "-----");
    console.log("req.body keys:", Object.keys(updatedData));
    if (updatedData.sections) {
      console.log("sections keys:", Object.keys(updatedData.sections));
    }

    const { data, error } = await updateDSAQuestionInDB(
      questionId,
      updatedData,
    );

    if (error) {
      console.error("DB Update Error:", error);
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message:
            typeof error === "string" ? error : "Failed to update DSA question",
        }),
      );
    }

    console.log(
      "DB Update Success Result Sections:",
      data?.sections
        ? "Sections Exist in Return"
        : "Sections MISSING in Return",
    );

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: "DSA question updated successfully",
      }),
    );
  } catch (error: any) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: error.message || "Failed during update",
      }),
    );
  }
};

export default withApiHandler(handler);
