import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  buildUserSocialProfileUpdate,
  getPYUserByIdFromDB,
  updatePYUserByIdInDB,
} from "@/lib/database";
import type { PrepYatraOnboardingPayload } from "@/lib/interfaces";
import { emailTriggerService } from "@/lib/services/triggers";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { normalizeCompanyTypeArray } from "@/lib/validation";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "POST":
      return handleOnboarding(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        }),
      );
  }
};

const handleOnboarding = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      userId,
      name,
      username,
      goal,
      targetCompanies,
      preferredCategories,
      experienceLevel,
      workDomain,
      linkedInUrl,
      githubUrl,
      leetCodeUrl,
    }: PrepYatraOnboardingPayload = req.body;

    if (!userId || !name || !username || !goal) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Required fields: userId, name, username, goal",
        }),
      );
    }

    const {
      values: normalizedTargetCompanies,
      invalid: invalidTargetCompanies,
    } = normalizeCompanyTypeArray(
      Array.isArray(targetCompanies)
        ? targetCompanies.map((entry) => String(entry))
        : [],
    );

    if (invalidTargetCompanies.length > 0) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Invalid targetCompanies: ${invalidTargetCompanies.join(", ")}`,
        }),
      );
    }

    logger.info("Onboarding request body", { body: req.body });

    const userResult = await getPYUserByIdFromDB(userId);
    if (userResult.error || !userResult.data) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: "User not found",
        }),
      );
    }
    const existingUser = userResult.data;

    if (existingUser.prepYatra?.pyOnboarded) {
      const updateResult = await updatePYUserByIdInDB(userId, {
        ...buildUserSocialProfileUpdate({
          name,
          userName: username,
          linkedInUrl,
          githubUrl,
          leetCodeUrl,
        }),
        "prepYatra.goal": goal,
        "prepYatra.targetCompanies": normalizedTargetCompanies,
        "prepYatra.preferences.interviewCategories": preferredCategories,
        "prepYatra.preferences.focusAreas": normalizedTargetCompanies,
        "prepYatra.experienceLevel": experienceLevel,
        "prepYatra.workDomain": workDomain,
      });
      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          data: {
            user: updateResult.data,
          },
          message: "Onboarding preferences updated successfully",
        }),
      );
    }

    const updateResult = await updatePYUserByIdInDB(userId, {
      ...buildUserSocialProfileUpdate({
        name,
        userName: username,
        linkedInUrl,
        githubUrl,
        leetCodeUrl,
      }),
      "prepYatra.pyOnboarded": true,
      "prepYatra.goal": goal,
      "prepYatra.targetCompanies": normalizedTargetCompanies,
      "prepYatra.preferences.interviewCategories": preferredCategories,
      "prepYatra.preferences.focusAreas": normalizedTargetCompanies,
      "prepYatra.experienceLevel": experienceLevel,
      "prepYatra.workDomain": workDomain,
    });

    if (updateResult.data) {
      emailTriggerService
        .sendExternalEmail({
          emailType: "ONBOARDING",
          userData: {
            email: updateResult.data.email,
            name: updateResult.data.name,
            id: updateResult.data._id.toString(),
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
        data: {
          user: updateResult.data,
        },
        message: "Onboarding completed successfully",
      }),
    );
  } catch (error: any) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed during onboarding",
        error: error.message,
      }),
    );
  }
};

export default withApiHandler(handler);
