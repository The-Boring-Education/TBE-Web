import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { createAdminUserFromDB, getAllAdminUsersFromDB } from "@/lib/database";
import { invalidateAdminCache } from "@/lib/services/admin-cache";
import { sendAPIResponse } from "@/lib/utils";
import { isValidEmail } from "@/lib/utils/email";
import { logger } from "@/lib/utils/logger";
import {
  type AdminAuthenticatedRequest,
  withVerifiedAdminAuth,
} from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

interface CreateAdminRequest {
  email: string;
  name?: string;
  notes?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "GET":
      return handleGetAllAdmins(res);
    case "POST":
      return handleCreateAdmin(req as AdminAuthenticatedRequest, res);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${method} not allowed`,
        }),
      );
  }
};

const handleGetAllAdmins = async (res: NextApiResponse) => {
  try {
    const { data: admins, error } = await getAllAdminUsersFromDB();

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: error,
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Admin users fetched successfully",
        data: admins,
      }),
    );
  } catch (error) {
    logger.error("Error fetching admin users", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal server error while fetching admin users",
      }),
    );
  }
};

const handleCreateAdmin = async (
  req: AdminAuthenticatedRequest,
  res: NextApiResponse,
) => {
  try {
    const body = req.body as CreateAdminRequest;

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
      addedBy: req.adminUser?.email,
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
        message: "Admin user created successfully",
        data: admin,
      }),
    );
  } catch (error) {
    logger.error("Error creating admin user", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal server error while creating admin user",
      }),
    );
  }
};

export default withApiHandler(withVerifiedAdminAuth(handler));
