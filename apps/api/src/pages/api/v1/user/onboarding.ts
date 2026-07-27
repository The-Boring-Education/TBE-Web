import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  getUserByUserNameFromDB,
  onboardPrepYatraUserTODB,
  onboardUserToDB,
} from "@/lib/database";
import { User } from "@/lib/database/models";
import type {
  AddOnboardingPayloadProps,
  AddPrepYatraOnboardingPayloadProps,
} from "@/lib/interfaces";
import { emailTriggerService } from "@/lib/services";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withUserAuth } from "@/middleware/admin";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const { userId, userName } = req.query as {
    userId: string;
    userName: string;
  };

  switch (method) {
    case "GET":
      return getUserByUsername(req, res, userName);
    case "POST":
      return withUserAuth(
        async (req, res) => handleUserOnboarding(req, res, userId),
        { ownerRequired: true },
      )(req, res);
    case "PUT":
      return withUserAuth(
        async (req, res) => handlePrepYatraOnboarding(req, res, userId),
        { ownerRequired: true },
      )(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${method} Not Allowed`,
        }),
      );
  }
};

const getUserByUsername = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userName: string,
) => {
  if (!userName) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Username is required",
      }),
    );
  }

  try {
    const { data, error } = await getUserByUserNameFromDB(userName);

    if (error) {
      // Username already exists
      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: false,
          message: "Username already taken. Please choose another.",
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: "Username is available.",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Error while checking userName",
        error,
      }),
    );
  }
};

const handleUserOnboarding = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
) => {
  try {
    const { userName, occupation, purpose, contactNo, from } =
      req.body as AddOnboardingPayloadProps;

    if (!userId || !userName || !occupation || !purpose || !contactNo) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          error: "Missing required fields",
          message: "Please provide all required fields",
        }),
      );
    }

    const { data, error: updateUserError } = await onboardUserToDB(
      userId,
      userName,
      occupation,
      purpose,
      contactNo,
      from,
    );

    if (updateUserError) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          error: updateUserError,
          message: "Error while onboarding user",
        }),
      );
    }

    if (data) {
      emailTriggerService
        .sendExternalEmail({
          emailType: "ONBOARDING",
          userData: {
            email: data.email,
            name: data.name,
            id: data._id.toString(),
          },
          additionalData: {
            app: "platform",
            subject: "Your tech education is now unlocked! 🛠️",
          },
        })
        .catch((err) => {
          logger.error("Failed to send platform onboarding email", {
            error: err,
          });
        });
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: "User onboarded successfully",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        error,
        message: "Error while onboarding user",
      }),
    );
  }
};

const handlePrepYatraOnboarding = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
) => {
  try {
    const { workDomain, linkedInUrl, from } =
      req.body as AddPrepYatraOnboardingPayloadProps;

    if (!userId || !workDomain) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          error: "Missing required fields",
          message: "Please provide all required fields",
        }),
      );
    }

    const existingUser = await User.findById(userId);
    const alreadyOnboarded = existingUser?.prepYatra?.pyOnboarded;

    const { data, error: onboardUserError } = await onboardPrepYatraUserTODB(
      userId,
      workDomain,
      linkedInUrl,
      from,
    );

    if (onboardUserError) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          error: onboardUserError,
          message: "Error while onboarding user",
        }),
      );
    }

    if (data && !alreadyOnboarded) {
      emailTriggerService
        .sendExternalEmail({
          emailType: "ONBOARDING",
          userData: {
            email: data.email,
            name: data.name,
            id: data._id.toString(),
          },
          additionalData: {
            app: "prepyatra",
            subject: "PrepYatra Onboarding Completed! 🚀",
          },
        })
        .catch((err) => {
          logger.error("Failed to send PrepYatra onboarding email", {
            error: err,
          });
        });
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: "User onboarded successfully",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        error,
        message: "Error while onboarding user",
      }),
    );
  }
};

export default withApiHandler(handler);
