import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  getDsaYatraProgressFromDB,
  handleGamificationPoints,
  mergeDsaYatraProgressInDB,
  patchDsaYatraQuestionCompletionInDB,
} from "@/lib/database";
import type {
  DsaYatraProgressResponseProps,
  GetDsaYatraProgressQueryProps,
  PatchDsaYatraQuestionCompletionProps,
  PutDsaYatraProgressMergeProps,
} from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { method } = req;

    switch (method) {
      case "GET":
        return handleGetProgress(req, res);
      case "PATCH":
        return handlePatchQuestion(req, res);
      case "PUT":
        return handleMergeProgress(req, res);
      default:
        return res.status(apiStatusCodes.BAD_REQUEST).json(
          sendAPIResponse({
            status: false,
            message: `Method ${req.method} Not Allowed`,
          }),
        );
    }
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Something went wrong",
        error,
      }),
    );
  }
};

const handleGetProgress = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId } = req.query as unknown as GetDsaYatraProgressQueryProps;

  if (!userId) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "userId is required",
      }),
    );
  }

  try {
    const { data, error } = await getDsaYatraProgressFromDB(userId);

    if (error) {
      const notFound = error === "User not found";
      return res
        .status(
          notFound
            ? apiStatusCodes.NOT_FOUND
            : apiStatusCodes.INTERNAL_SERVER_ERROR,
        )
        .json(
          sendAPIResponse({
            status: false,
            message:
              typeof error === "string" ? error : "Failed to load progress",
          }),
        );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: "DSA Yatra progress loaded",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to load progress",
        error,
      }),
    );
  }
};

const handlePatchQuestion = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { userId, questionId, isCompleted } =
    req.body as PatchDsaYatraQuestionCompletionProps;

  if (!userId || questionId === undefined || questionId === null) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "userId and questionId are required",
      }),
    );
  }

  if (typeof isCompleted !== "boolean") {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "isCompleted must be a boolean",
      }),
    );
  }

  try {
    const beforeResult = await getDsaYatraProgressFromDB(userId);
    if (beforeResult.error || !beforeResult.data) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: "User not found",
        }),
      );
    }
    const before = beforeResult.data as DsaYatraProgressResponseProps;
    const qid = String(questionId);
    const hadBefore = before.completedQuestionIds.some(
      (id: string) => String(id) === qid,
    );

    const { data, error } = await patchDsaYatraQuestionCompletionInDB(
      userId,
      questionId,
      isCompleted,
    );

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed to update question progress",
        }),
      );
    }

    const progressChanged = hadBefore !== isCompleted;
    if (progressChanged) {
      await handleGamificationPoints(isCompleted, userId, "COMPLETE_QUESTION");
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: "Question progress updated",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to update question progress",
        error,
      }),
    );
  }
};

const handleMergeProgress = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { userId, addCompletedQuestionIds, todayStats } =
    req.body as PutDsaYatraProgressMergeProps;

  if (!userId || !Array.isArray(addCompletedQuestionIds)) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "userId and addCompletedQuestionIds (array) are required",
      }),
    );
  }

  try {
    const { data, error } = await mergeDsaYatraProgressInDB(
      userId,
      addCompletedQuestionIds.map((id) => String(id)),
      todayStats,
    );

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed to merge progress",
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: "Progress merged",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to merge progress",
        error,
      }),
    );
  }
};

export default withApiHandler(handler);
