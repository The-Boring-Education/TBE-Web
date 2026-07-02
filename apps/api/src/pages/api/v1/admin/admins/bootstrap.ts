import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  countAllAdminUsersFromDB,
  createAdminUserFromDB,
} from "@/lib/database";
import { invalidateAdminCache } from "@/lib/services/admin-cache";
import { sendAPIResponse } from "@/lib/utils";
import { isValidEmail } from "@/lib/utils/email";
import { logger } from "@/lib/utils/logger";
import { adminMiddleware } from "@/middleware/api";
import { withApiHandler } from "@/middleware/requestLogger";

interface BootstrapAdminRequest {
  email: string;
  name?: string;
  notes?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} not allowed`,
      }),
    );
  }

  const authorized = await adminMiddleware(req, res);
  if (!authorized) return;

  try {
    const { data: totalCount, error: countError } =
      await countAllAdminUsersFromDB();

    if (countError) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: countError,
        }),
      );
    }

    if (typeof totalCount === "number" && totalCount > 0) {
      return res.status(409).json(
        sendAPIResponse({
          status: false,
          message:
            "Admin users already exist. Use the admin panel to add more admins.",
        }),
      );
    }

    const body = req.body as BootstrapAdminRequest;
    if (!body?.email || !isValidEmail(body.email)) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "A valid email is required",
        }),
      );
    }

    const { data: admin, error } = await createAdminUserFromDB({
      email: body.email,
      name: body.name,
      notes: body.notes,
    });

    if (error) {
      const status =
        error === "Admin user with this email already exists"
          ? 409
          : apiStatusCodes.INTERNAL_SERVER_ERROR;

      return res.status(status).json(
        sendAPIResponse({
          status: false,
          message: error,
        }),
      );
    }

    invalidateAdminCache();

    return res.status(apiStatusCodes.RESOURCE_CREATED).json(
      sendAPIResponse({
        status: true,
        message: "First admin user bootstrapped successfully",
        data: admin,
      }),
    );
  } catch (error) {
    logger.error("Error bootstrapping admin user", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal server error while bootstrapping admin user",
      }),
    );
  }
};

export default withApiHandler(handler);
