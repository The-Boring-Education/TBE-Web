import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { getDYUserByIdFromDB, updateDYUserByIdInDB } from "@/lib/database";
import type { DSAYatraOnboardingPayload } from "@/lib/interfaces";
import { cors, sendAPIResponse } from "@/lib/utils";
import { connectDB } from "@/middleware/api";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);

  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  await connectDB();
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
      timeline,
      target,
      preferredLanguage,
      experienceLevel,
      targetTopics,
    }: DSAYatraOnboardingPayload = req.body;

    if (!userId || !name || !username || !timeline || !target) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Required fields: userId, name, username, timeline, target",
        }),
      );
    }

    const userResult = await getDYUserByIdFromDB(userId);
    if (userResult.error || !userResult.data) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: "User not found",
        }),
      );
    }
    const existingUser = userResult.data;

    const updatePayload = {
      name,
      userName: username,
      "dsaYatra.dyOnboarded": true,
      "dsaYatra.timeline": timeline,
      "dsaYatra.target": target,
      "dsaYatra.preferredLanguage": preferredLanguage,
      "dsaYatra.experienceLevel": experienceLevel,
      "dsaYatra.targetTopics": targetTopics,
    };

    const updateResult = await updateDYUserByIdInDB(userId, updatePayload);

    if (updateResult.error) {
      throw new Error(updateResult.error);
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: {
          user: updateResult.data,
        },
        message: existingUser.dsaYatra?.dyOnboarded
          ? "Onboarding preferences updated successfully"
          : "Onboarding completed successfully",
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

export default handler;
