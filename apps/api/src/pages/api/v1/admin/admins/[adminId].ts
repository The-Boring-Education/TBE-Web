import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  deleteAdminUserFromDB,
  getAdminUserByIdFromDB,
  updateAdminUserFromDB,
} from "@/lib/database";
import { invalidateAdminCache } from "@/lib/services/admin-cache";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withVerifiedAdminAuth } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

interface UpdateAdminRequest {
  name?: string;
  notes?: string;
  isActive?: boolean;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { adminId } = query;

  if (!adminId || typeof adminId !== "string") {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Admin ID is required",
      }),
    );
  }

  switch (method) {
    case "GET":
      return handleGetAdmin(adminId, res);
    case "PATCH":
      return handleUpdateAdmin(req, res, adminId);
    case "DELETE":
      return handleDeleteAdmin(adminId, res);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${method} not allowed`,
        }),
      );
  }
};

const handleGetAdmin = async (adminId: string, res: NextApiResponse) => {
  try {
    const { data: admin, error } = await getAdminUserByIdFromDB(adminId);

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
        message: "Admin user fetched successfully",
        data: admin,
      }),
    );
  } catch (error) {
    logger.error("Error fetching admin user", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal server error while fetching admin user",
      }),
    );
  }
};

const handleUpdateAdmin = async (
  req: NextApiRequest,
  res: NextApiResponse,
  adminId: string,
) => {
  try {
    const updateData = req.body as UpdateAdminRequest;

    const { data: admin, error } = await updateAdminUserFromDB(
      adminId,
      updateData,
    );

    if (error) {
      const status =
        error === "Admin user not found"
          ? apiStatusCodes.NOT_FOUND
          : error === "Cannot deactivate the last active admin"
            ? apiStatusCodes.BAD_REQUEST
            : apiStatusCodes.INTERNAL_SERVER_ERROR;

      return res.status(status).json(
        sendAPIResponse({
          status: false,
          message: error,
        }),
      );
    }

    invalidateAdminCache();

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Admin user updated successfully",
        data: admin,
      }),
    );
  } catch (error) {
    logger.error("Error updating admin user", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal server error while updating admin user",
      }),
    );
  }
};

const handleDeleteAdmin = async (adminId: string, res: NextApiResponse) => {
  try {
    const { error } = await deleteAdminUserFromDB(adminId);

    if (error) {
      const status =
        error === "Admin user not found"
          ? apiStatusCodes.NOT_FOUND
          : error === "Cannot delete the last active admin"
            ? apiStatusCodes.BAD_REQUEST
            : apiStatusCodes.INTERNAL_SERVER_ERROR;

      return res.status(status).json(
        sendAPIResponse({
          status: false,
          message: error,
        }),
      );
    }

    invalidateAdminCache();

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Admin user deleted successfully",
      }),
    );
  } catch (error) {
    logger.error("Error deleting admin user", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal server error while deleting admin user",
      }),
    );
  }
};

export default withApiHandler(withVerifiedAdminAuth(handler));
