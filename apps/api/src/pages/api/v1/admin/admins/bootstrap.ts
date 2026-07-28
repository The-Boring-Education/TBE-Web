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
import { ensureAdminAccess, verifyAuthenticatedUser } from "@/middleware/admin";
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

  try {
    const authenticatedUser = verifyAuthenticatedUser(req);
    if (!authenticatedUser) {
      return res.status(apiStatusCodes.UNAUTHORIZED).json(
        sendAPIResponse({
          status: false,
          message: "Authentication required",
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
      const authorized = await ensureAdminAccess(req, res);
      if (!authorized) return;

      return res.status(409).json(
        sendAPIResponse({
          status: false,
          message:
            "Admin users already exist. Use the admin panel to add more admins.",
        }),
      );
    }

    const normalizedAuthenticatedEmail = authenticatedUser.email
      .trim()
      .toLowerCase();
    const normalizedRequestedEmail = body.email.trim().toLowerCase();
    const bootstrapEmails = (process.env.ADMIN_BOOTSTRAP_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    if (!bootstrapEmails.includes(normalizedAuthenticatedEmail)) {
      return res.status(apiStatusCodes.FORBIDDEN).json(
        sendAPIResponse({
          status: false,
          message: "Authenticated user is not allowlisted for bootstrap",
        }),
      );
    }

    if (normalizedAuthenticatedEmail !== normalizedRequestedEmail) {
      return res.status(apiStatusCodes.FORBIDDEN).json(
        sendAPIResponse({
          status: false,
          message:
            "Bootstrap is only allowed for the authenticated user's email",
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
