import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes, COURSE_STATUS } from "@/lib/constants";
import { updateCourseStatusInDB } from "@/lib/database";
import type { CourseStatusType } from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils";
import { captureAPIError } from "@/lib/utils/sentry";
import { withVerifiedAdminAuth } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { courseId } = query as { courseId: string };

  switch (method) {
    case "PATCH":
      return handleUpdateCourseStatus(req, res, courseId);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${method} Not Allowed`,
        }),
      );
  }
};

const handleUpdateCourseStatus = async (
  req: NextApiRequest,
  res: NextApiResponse,
  courseId: string,
) => {
  const { status } = (req.body ?? {}) as { status?: CourseStatusType };

  if (!status || !COURSE_STATUS.includes(status)) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: `Invalid course status. Allowed values: ${COURSE_STATUS.join(", ")}`,
      }),
    );
  }

  try {
    const { data, error } = await updateCourseStatusInDB(courseId, status);

    if (error) {
      const isNotFound = error === "Course not found";

      return res
        .status(
          isNotFound ? apiStatusCodes.NOT_FOUND : apiStatusCodes.BAD_REQUEST,
        )
        .json(
          sendAPIResponse({
            status: false,
            message: error,
            error,
          }),
        );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: `Course status updated to ${status}`,
      }),
    );
  } catch (error) {
    captureAPIError(
      error instanceof Error ? error : new Error(String(error)),
      "/api/v1/shiksha/[courseId]/status",
      "PATCH",
      apiStatusCodes.INTERNAL_SERVER_ERROR,
      { courseId, status },
    );

    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed while updating course status",
        error,
      }),
    );
  }
};

export default withApiHandler(withVerifiedAdminAuth(handler));
