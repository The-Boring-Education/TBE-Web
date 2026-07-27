import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  buildUserSocialProfileUpdate,
  getPYUserByIdFromDB,
  updatePYUserByIdInDB,
} from "@/lib/database";
import type { PrepYatraOnboardingPayload } from "@/lib/interfaces";
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
      occupation,
      purpose,
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

    const pyUpdateFields: Record<string, any> = {
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
    };

    if (occupation) {
      pyUpdateFields.occupation = occupation;
    }
    if (purpose) {
      pyUpdateFields.purpose = Array.isArray(purpose) ? purpose : [purpose];
    }

    if (existingUser.prepYatra?.pyOnboarded) {
      const updateResult = await updatePYUserByIdInDB(userId, pyUpdateFields);
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

    pyUpdateFields["prepYatra.pyOnboarded"] = true;
    const updateResult = await updatePYUserByIdInDB(userId, pyUpdateFields);
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
