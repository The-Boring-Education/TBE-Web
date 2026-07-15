import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  handleGamificationPoints,
  updateUserCourseChapterInDB,
} from "@/lib/database";
import type { UpdateUserChapterInCourseRequestProps } from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils";
import { withUserAuth } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { method } = req;

    switch (method) {
      case "PATCH":
        return withUserAuth(
          async (req, res) => handleUpdateChapterStatus(req, res),
          { ownerRequired: true },
        )(req, res);
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
        message: `Something went wrong`,
        error,
      }),
    );
  }
};

const handleUpdateChapterStatus = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { userId, courseId, chapterId, isCompleted } =
    req.body as UpdateUserChapterInCourseRequestProps;

  try {
    const { data, error } = await updateUserCourseChapterInDB({
      userId,
      courseId,
      chapterId,
      isCompleted,
    });

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed to update chapter status",
        }),
      );
    }

    await handleGamificationPoints(
      isCompleted,
      userId,
      "COMPLETE_COURSE_CHAPTER",
    );

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: "Chapter status updated successfully",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to update chapter status",
        error,
      }),
    );
  }
};

export default withApiHandler(handler);
