import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { updateUserSkillsInDB, User } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "POST":
      return handleAddUserSkills(req, res);
    case "DELETE":
      return handleRemoveUserSkill(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${method} Not Allowed`,
        }),
      );
  }
};

const getUserIdForAction = async (
  userField: string,
): Promise<string | null> => {
  // Check if userField is a valid MongoDB ObjectId
  if (/^[0-9a-fA-F]{24}$/.test(userField)) {
    return userField;
  }

  // For non-ObjectId user IDs, find the user in the User collection
  const userDoc = await User.findOne({
    $or: [{ email: userField }, { providerAccountId: userField }],
  });

  return userDoc ? userDoc._id.toString() : null;
};

const handleAddUserSkills = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const { userId: userField, userSkills } = req.body as {
      userId: string;
      userSkills: string[];
    };

    if (!userField || !Array.isArray(userSkills)) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "userId and userSkills (array) are required",
        }),
      );
    }

    const userId = await getUserIdForAction(userField);
    if (!userId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "User not found",
        }),
      );
    }

    const { data, error } = await updateUserSkillsInDB(userId, userSkills);
    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed to update user skills",
          error,
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: "User skills updated successfully",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal Server Error",
        error,
      }),
    );
  }
};

const handleRemoveUserSkill = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const { userId: userField, skill } = req.body as {
      userId: string;
      skill: string;
    };

    if (!userField || !skill) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "userId and skill are required",
        }),
      );
    }

    const userId = await getUserIdForAction(userField);
    if (!userId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "User not found",
        }),
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { userSkills: skill },
        userSkillsLastUpdated: new Date(),
      },
      { new: true },
    );

    if (!user) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "User not found",
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: user,
        message: "User skill removed successfully",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal Server Error",
        error,
      }),
    );
  }
};

export default withApiHandler(handler);
