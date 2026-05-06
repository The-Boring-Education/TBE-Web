import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { getPYUserByIdFromDB, updatePYUserByIdInDB } from "@/lib/database";
import type { PrepYatraOnboardingPayload } from "@/lib/interfaces";
import {
  sendAPIResponse,
  trackPersonalizationInvalidInput,
  trackPersonalizationNormalizationFallback,
} from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import {
  isCanonicalCompanyTypeInput,
  normalizeCompanyTypeArray,
} from "@/lib/validation";
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

    const rawTargetCompanies = Array.isArray(targetCompanies)
      ? targetCompanies.map((entry) => String(entry))
      : [];

    const {
      values: normalizedTargetCompanies,
      invalid: invalidTargetCompanies,
    } = normalizeCompanyTypeArray(rawTargetCompanies);

    const canonicalCompanyInputCount = rawTargetCompanies.filter((entry) =>
      isCanonicalCompanyTypeInput(entry),
    ).length;
    const fallbackCount =
      rawTargetCompanies.length -
      canonicalCompanyInputCount -
      invalidTargetCompanies.length;

    if (fallbackCount > 0) {
      trackPersonalizationNormalizationFallback({
        route: "POST /api/v1/prepyatra/onboarding",
        field: "companyType",
        fallbackCount,
        rawValue: rawTargetCompanies
          .filter((entry) => !isCanonicalCompanyTypeInput(entry))
          .slice(0, 3)
          .join(", "),
        normalizedValue: normalizedTargetCompanies.join(", "),
      });
    }

    if (invalidTargetCompanies.length > 0) {
      trackPersonalizationInvalidInput({
        route: "POST /api/v1/prepyatra/onboarding",
        field: "companyType",
        reason: "Invalid targetCompanies in onboarding payload",
        value: invalidTargetCompanies,
      });

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
        name,
        userName: username,
        linkedInUrl,
        githubUrl,
        leetCodeUrl,
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
      name,
      userName: username,
      linkedInUrl,
      githubUrl,
      leetCodeUrl,
      "prepYatra.pyOnboarded": true,
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
