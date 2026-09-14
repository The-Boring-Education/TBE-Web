import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  getUserByUserNameFromDB,
  onboardPrepYatraUserTODB,
  onboardUserToDB,
} from "@/lib/database";
import { User } from "@/lib/database/models";
import type { AddPrepYatraOnboardingPayloadProps } from "@/lib/interfaces";
import { emailTriggerService } from "@/lib/services";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { isMongoObjectIdString } from "@/lib/validation/mongodb";
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
        async (req, res) =>
          handleUserOnboarding(
            req,
            res,
            userId || (req.body?.userId as string),
          ),
        { ownerRequired: true, allowUnauthenticated: true },
      )(req, res);
    case "PUT":
      return withUserAuth(
        async (req, res) =>
          handlePrepYatraOnboarding(
            req,
            res,
            userId || (req.body?.userId as string),
          ),
        { ownerRequired: true, allowUnauthenticated: true },
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
    // Validate userId is a valid MongoDB ObjectId to prevent NoSQL injection
    if (!isMongoObjectIdString(userId)) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          error: "Invalid userId format",
          message: "Please provide a valid userId",
        }),
      );
    }

    const existingUser = await User.findById(userId);
    const alreadyOnboarded = existingUser?.isOnboarded;

    const userName =
      req.body?.userName || existingUser?.userName || existingUser?.name || "";
    const occupation =
      req.body?.occupation || existingUser?.occupation || "TECH_STUDENT";
    const purpose = req.body?.purpose || existingUser?.purpose || ["web_dev"];
    const contactNo = req.body?.contactNo || existingUser?.contactNo || "+91";
    const from = req.body?.from;

    if (!userId || !userName || !occupation || !purpose) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          error: "Missing required fields",
          message: "Please provide all required fields",
        }),
      );
    }

    let sanitizedContactNo = contactNo;
    if (contactNo && contactNo.trim() !== "+91") {
      const trimmed = contactNo.trim();
      const parts = trimmed.split(/\s+/);
      const code = parts[0];
      const number = parts.slice(1).join("").replace(/\D/g, "");
      const isValidCountryCode = /^\+\d{1,4}$/.test(code);
      const isValidNumber = number.length === 10;

      if (!isValidCountryCode || !isValidNumber) {
        return res.status(apiStatusCodes.BAD_REQUEST).json(
          sendAPIResponse({
            status: false,
            error: "Invalid contact number format",
            message:
              "Please provide a valid 10-digit contact number with country code (e.g. +91 9876543210)",
          }),
        );
      }

      sanitizedContactNo = `${code} ${number}`;
    }

    const { data, error: updateUserError } = await onboardUserToDB(
      userId,
      userName,
      occupation,
      purpose,
      sanitizedContactNo,
      from,
      req.body,
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

    // Validate userId is a valid MongoDB ObjectId to prevent NoSQL injection
    if (!isMongoObjectIdString(userId)) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          error: "Invalid userId format",
          message: "Please provide a valid userId",
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
