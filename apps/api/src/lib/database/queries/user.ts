import type {
  CreateUserRequestPayloadProps,
  DatabaseQueryResponseType,
  PlatformUsageType,
  UserRoleType,
  WorkDomainType,
} from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";
import { buildUserSocialProfileUpdate } from "@/lib/utils/userSocialProfile";

import { User } from "../models";

export { buildUserSocialProfileUpdate } from "@/lib/utils/userSocialProfile";

const getUserByIdFromDB = async (
  id: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const user = await User.findById(id);

    if (!user) return { error: "User does not exists" };

    return { data: user };
  } catch (error) {
    logger.error("DB: getUserByIdFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Error while fetching user", details: error };
  }
};

const getUserByEmailFromDB = async (
  email: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const user = await User.findOne({ email });

    if (!user) return { error: "User does not exists" };

    return { data: user };
  } catch (error) {
    logger.error("DB: getUserByEmailFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed while fetching user", details: error };
  }
};

const createUserInDB = async (
  userPayload: CreateUserRequestPayloadProps,
): Promise<DatabaseQueryResponseType> => {
  try {
    const user = await User.create(userPayload);
    return { data: user };
  } catch (error) {
    logger.error("DB: createUserInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed while creating user", details: error };
  }
};

const getUserByUserNameFromDB = async (
  userName: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    if (!userName) {
      return { error: "Username is required" };
    }

    const existingUser = await User.findOne({ userName });

    if (existingUser) {
      return { error: "Username already taken" };
    }

    return { data: true };
  } catch (error) {
    logger.error("DB: getUserByUserNameFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "An error occurred while checking the userName",
      details: error,
    };
  }
};

const onboardUserToDB = async (
  userId: string,
  userName: string,
  occupation: UserRoleType,
  purpose: PlatformUsageType[],
  contactNo: string,
  from?: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const updateData: any = {
      userName,
      occupation,
      purpose,
      contactNo,
      isOnboarded: true,
    };

    // Only add 'from' if it doesn't already exist
    if (from) {
      const existingUser = await User.findById(userId);
      if (!existingUser?.from) {
        updateData.from = from;
      }
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!user) return { error: "User does not exist" };

    return { data: user };
  } catch (error) {
    logger.error("DB: onboardUserToDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to onboard user", details: error };
  }
};

const onboardPrepYatraUserTODB = async (
  userId: string,
  workDomain: WorkDomainType,
  linkedInUrl: string,
  from?: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const updateData: Record<string, unknown> = {
      ...buildUserSocialProfileUpdate({ linkedInUrl }),
      prepYatra: {
        workDomain,
        pyOnboarded: true,
      },
    };

    // Only add 'from' if it doesn't already exist
    if (from) {
      const existingUser = await User.findById(userId);
      if (!existingUser?.from) {
        updateData.from = from;
      }
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!user) return { error: "User does not exist" };

    return { data: user };
  } catch (error) {
    logger.error("DB: onboardPrepYatraUserTODB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to onboard PrepYatra user", details: error };
  }
};

const updateUserSkillsInDB = async (
  userId: string,
  userSkills: string[],
): Promise<DatabaseQueryResponseType> => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: userId },
      {
        $addToSet: { userSkills: { $each: userSkills } },
        userSkillsLastUpdated: new Date(),
      },
      { new: true },
    );
    if (!user) return { error: "User does not exist" };
    return { data: user };
  } catch (error) {
    logger.error("DB: updateUserSkillsInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to update user skills", details: error };
  }
};

const getUserDataByUserNameFromDB = async (
  userName: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const user = await User.findOne({ userName });
    return { data: user };
  } catch (error) {
    logger.error("DB: getUserDataByUserNameFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to fetch user from DB", details: error };
  }
};

export {
  createUserInDB,
  getUserByEmailFromDB,
  getUserByIdFromDB,
  getUserByUserNameFromDB,
  getUserDataByUserNameFromDB,
  onboardPrepYatraUserTODB,
  onboardUserToDB,
  updateUserSkillsInDB,
};
