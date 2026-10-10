/**
 * Admin-guarded Course Bundle Import.
 *
 * The Bundle is validated first and rejected with the validator's field-level
 * errors unchanged, so nothing is written for an invalid file. `dryRun`
 * returns the identical report without writing — the Admin UI's pre-flight.
 */

import { validateCourseBundle } from "@tbe/utils";
import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { importCourseBundleToDB } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { captureAPIError } from "@/lib/utils/sentry";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "POST":
      return handlePostCourseBundleImport(req, res);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        }),
      );
  }
};

const handlePostCourseBundleImport = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const body = (req.body ?? {}) as { bundle?: unknown; dryRun?: unknown };

  const validation = validateCourseBundle(body.bundle);

  if (!validation.valid) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Invalid course bundle",
        error: validation.errors,
      }),
    );
  }

  const { data, error } = await importCourseBundleToDB({
    bundle: validation.bundle,
    dryRun: body.dryRun === true,
  });

  if (error) {
    captureAPIError(
      new Error(String(error)),
      "/api/v1/admin/course-bundle/import",
      "POST",
      apiStatusCodes.INTERNAL_SERVER_ERROR,
      { slug: validation.bundle.course.slug },
    );

    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed while importing course bundle",
        error,
      }),
    );
  }

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data,
      message: data.dryRun
        ? "Course bundle dry run completed"
        : "Course bundle imported successfully",
    }),
  );
};

export default withApiHandler(handler, { admin: { allowSecret: true } });
