import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  buildUserSocialProfileUpdate,
  createUserInDB,
  getUserByEmailFromDB,
  getUserByIdFromDB,
  getUserDataByUserNameFromDB,
} from "@/lib/database";
import User from "@/lib/database/models/User";
import type { CreateUserRequestPayloadProps } from "@/lib/interfaces";
import { sendWelcomeEmail } from "@/lib/services";
import { isAdminEmail } from "@/lib/services/admin-cache";
import { sendAPIResponse } from "@/lib/utils";
import { captureAPIError, captureAuthError } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { verifyAuthenticatedUser, withUserAuth } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

const normalizeQueryParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) {
    return param[0] || "";
  }
  return param || "";
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const email = normalizeQueryParam(query.email);
  const userId = normalizeQueryParam(query.userId);
  const username = normalizeQueryParam(query.username);

  switch (method) {
    case "GET":
      if (email || userId) {
        return withUserAuth(
          async (req, res) => handleGetUser(req, res, email, userId, username),
          { ownerRequired: true },
        )(req, res);
      }
      return handleGetUser(req, res, email, userId, username);
    case "POST":
      return handleCreateUser(req, res);
    case "PATCH":
      return withUserAuth(
        async (req, res) => handleUpdateUserProfile(req, res),
        { ownerRequired: true },
      )(req, res);
  }
};

const handleGetUser = async (
  req: NextApiRequest,
  res: NextApiResponse,
  email: string,
  userId: string,
  username: string,
) => {
  try {
    if (email) {
      const { data, error } = await getUserByEmailFromDB(email);

      if (error) {
        captureAPIError(
          error as Error,
          "/api/v1/user",
          "GET",
          apiStatusCodes.INTERNAL_SERVER_ERROR,
          { email },
        );

        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
          sendAPIResponse({
            status: false,
            error,
            message: "Error while fetching user",
          }),
        );
      }

      return res
        .status(apiStatusCodes.OKAY)
        .json(sendAPIResponse({ status: true, data }));
    }

    if (userId) {
      const { data, error } = await getUserByIdFromDB(userId);

      if (error) {
        captureAPIError(
          error as Error,
          "/api/v1/user",
          "GET",
          apiStatusCodes.INTERNAL_SERVER_ERROR,
          { userId },
        );

        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
          sendAPIResponse({
            status: false,
            error,
            message: "Error while fetching user",
          }),
        );
      }

      return res
        .status(apiStatusCodes.OKAY)
        .json(sendAPIResponse({ status: true, data }));
    }

    if (username) {
      const { data, error } = await getUserDataByUserNameFromDB(username);

      if (error) {
        captureAPIError(
          error as Error,
          "/api/v1/user",
          "GET",
          apiStatusCodes.INTERNAL_SERVER_ERROR,
          { username },
        );

        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
          sendAPIResponse({
            status: false,
            error,
            message: "Error while fetching user",
          }),
        );
      }

      const payload = verifyAuthenticatedUser(req);
      let isSelf = false;
      if (payload && data) {
        const userIdStr = data._id ? data._id.toString() : "";
        isSelf =
          payload.sub === userIdStr ||
          payload.email === data.email ||
          (await isAdminEmail(payload.email));
      }

      if (!isSelf && data) {
        const sanitized = data.toObject ? data.toObject() : { ...data };
        delete sanitized.email;
        delete sanitized.contactNo;
        delete sanitized.provider;
        delete sanitized.providerAccountId;
        return res
          .status(apiStatusCodes.OKAY)
          .json(sendAPIResponse({ status: true, data: sanitized }));
      }

      return res
        .status(apiStatusCodes.OKAY)
        .json(sendAPIResponse({ status: true, data }));
    }

    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Please provide Email or User id or Username",
        error: "Please provide Email or User id or Username",
      }),
    );
  } catch (error) {
    captureAPIError(
      error as Error,
      "/api/v1/user",
      "GET",
      apiStatusCodes.INTERNAL_SERVER_ERROR,
      { email, userId, username },
    );

    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        error,
        message: "error while fetching user",
      }),
    );
  }
};

const handleCreateUser = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { name, email, provider, image, providerAccountId } =
      req.body as CreateUserRequestPayloadProps;

    if (!email || !name) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          error: "Please provide email and name",
          message: "Error while creating user",
        }),
      );
    }

    const { data } = await getUserByEmailFromDB(email);

    if (!data) {
      const { data, error } = await createUserInDB({
        name,
        email,
        provider,
        image,
        providerAccountId,
      });

      if (error) {
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
          sendAPIResponse({
            status: false,
            error,
            message: "Error while creating user",
          }),
        );
      }

      // Send welcome email (non-blocking)
      if (data && data._id) {
        sendWelcomeEmail({
          email,
          name,
          id: data._id.toString(),
        }).catch((error) => {
          logger.error("Failed to send welcome email", {
            error: error instanceof Error ? error.message : String(error),
          });
          // Don't fail the user creation if email fails
        });
      }

      return res
        .status(apiStatusCodes.OKAY)
        .json(sendAPIResponse({ status: true, data }));
    } else {
      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          data,
          message: "User already exists",
        }),
      );
    }
  } catch (error) {
    captureAuthError(error as Error, "user_creation", req.body?.email);

    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        error,
        message: "Error while creating user",
      }),
    );
  }
};

const handleUpdateUserProfile = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const { userId, name, username, linkedInUrl, githubUrl, leetCodeUrl } =
      req.body;

    if (!userId || typeof userId !== "string") {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Required field: userId",
        }),
      );
    }

    if (
      name === undefined &&
      username === undefined &&
      linkedInUrl === undefined &&
      githubUrl === undefined &&
      leetCodeUrl === undefined
    ) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "At least one field is required to update",
        }),
      );
    }

    const socialUpdates = buildUserSocialProfileUpdate({
      name,
      userName: username,
      linkedInUrl,
      githubUrl,
      leetCodeUrl,
    });

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: socialUpdates },
      { new: true },
    );

    if (!updated) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: "User not found",
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: updated,
        message: "User profile updated successfully",
      }),
    );
  } catch (error) {
    logger.error("PATCH /api/v1/user failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Server error",
      }),
    );
  }
};

export default withApiHandler(handler);
