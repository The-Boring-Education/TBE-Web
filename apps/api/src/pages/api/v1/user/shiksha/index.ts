import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { getAllEnrolledCoursesFromDB } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { withUserAuth } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { method, query } = req;
    const { userId } = query;

    switch (method) {
      case "GET":
        return withUserAuth(
          async (req, res) =>
            handleGetAllUserCourses(req, res, userId as string),
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

const handleGetAllUserCourses = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
) => {
  try {
    const { data: allCourses, error: fetchEnrolledCourseError } =
      await getAllEnrolledCoursesFromDB(userId);

    if (fetchEnrolledCourseError)
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed while fetching enrolled courses",
        }),
      );

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: allCourses,
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed while fetching enrolled courses",
        error,
      }),
    );
  }
};

export default withApiHandler(handler);
