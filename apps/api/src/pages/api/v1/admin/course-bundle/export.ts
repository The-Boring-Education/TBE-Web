/**
 * Admin-guarded Course Bundle Export: turns an existing Course, in any
 * lifecycle status, back into a Bundle that re-imports as a no-op.
 */

import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { exportCourseBundleFromDB } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { firstQueryValue } from "@/lib/validation/queryParams";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      return handleGetCourseBundleExport(req, res);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        }),
      );
  }
};

const handleGetCourseBundleExport = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const slug = firstQueryValue(req.query.slug)?.trim();

  if (!slug) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "slug is required",
      }),
    );
  }

  const { data, error } = await exportCourseBundleFromDB(slug);

  if (error) {
    const notFound = error === "Course not found";

    return res
      .status(
        notFound
          ? apiStatusCodes.NOT_FOUND
          : apiStatusCodes.INTERNAL_SERVER_ERROR,
      )
      .json(
        sendAPIResponse({
          status: false,
          message: notFound
            ? "Course not found"
            : "Failed while exporting course bundle",
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
};

export default withApiHandler(handler, { admin: { allowSecret: true } });
