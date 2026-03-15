import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  deleteACourseFromDBById,
  getACourseForUserFromDB,
  getACourseFromDBById,
  updateACourseInDB,
} from "@/lib/database";
import type { AddCourseRequestPayloadProps } from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { courseId, userId } = query as { courseId: string; userId: string };

  switch (method) {
    case "GET":
      return handleGetCourseById(req, res, userId, courseId);
    case "PATCH":
      return handleUpdateCourse(req, res, courseId);
    case "DELETE":
      return handleDeleteCourse(req, res, courseId);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        }),
      );
  }
};

const handleDeleteCourse = async (
  req: NextApiRequest,
  res: NextApiResponse,
  courseId: string,
) => {
  try {
    const { error } = await deleteACourseFromDBById(courseId);

    if (error)
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed while deleting course",
          error,
        }),
      );

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: null,
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed while deleting course",
        error,
      }),
    );
  }
};

const handleUpdateCourse = async (
  req: NextApiRequest,
  res: NextApiResponse,
  courseId: string,
) => {
  const updatedData = req.body as Partial<AddCourseRequestPayloadProps>;

  const { error } = await getACourseFromDBById(courseId);

  if (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Course not found",
        error,
      }),
    );
  }

  try {
    const { data, error } = await updateACourseInDB({
      updatedData,
      courseId,
    });

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed while updating course",
          error,
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed while updating course",
        error,
      }),
    );
  }
};

const handleGetCourseById = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
  courseId: string,
) => {
  try {
    const { data, error } = await getACourseForUserFromDB(userId, courseId);

    if (error) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: error,
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to fetch courses with chapter status",
        error,
      }),
    );
  }
};

export default withApiHandler(handler);
