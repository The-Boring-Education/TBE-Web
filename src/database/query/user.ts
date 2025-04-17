import {
  CreateUserRequestPayloadProps,
  DatabaseQueryResponseType,
  PlatformUsageType,
  UserRoleType,
} from '@/interfaces';
import { User } from '@/database';

const getUserByIdFromDB = async (
  id: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const user = await User.findById(id);

    if (!user) return { error: 'User does not exists' };

    return { data: user };
  } catch (error) {
    return { error: 'Error while fetching user' };
  }
};

const getUserByEmailFromDB = async (
  email: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const user = await User.findOne({ email });

    if (!user) return { error: 'User does not exists' };

    return { data: user };
  } catch (error) {
    return { error: 'Failed while fetching user' };
  }
};

const createUserInDB = async (
  userPayload: CreateUserRequestPayloadProps
): Promise<DatabaseQueryResponseType> => {
  try {
    const user = await User.create(userPayload);
    return { data: user };
  } catch (error) {
    return { error: 'Failed while creating user' };
  }
};

const getUserByUserNameFromDB = async (
  userName: string
): Promise<DatabaseQueryResponseType> => {
  try {
    if (!userName) {
      return { error: 'Username is required' };
    }

    const existingUser = await User.findOne({ userName });

    if (existingUser) {
      return { error: 'Username already taken' };
    }

    return { data: true };
  } catch (error) {
    return { error: 'An error occurred while checking the userName' };
  }
};

const onboardUserToDB = async (
  userId: string,
  userName: string,
  profession: UserRoleType,
  purpose: PlatformUsageType[],
  contactNo: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        userName,
        profession,
        purpose,
        contactNo,
        isOnboarded: true,
      },
      { new: true }
    );

    if (!user) return { error: 'User does not exist' };

    return { data: user };
  } catch (error) {
    return { error };
  }
};

export {
  getUserByIdFromDB,
  getUserByEmailFromDB,
  createUserInDB,
  onboardUserToDB,
  getUserByUserNameFromDB,
};
