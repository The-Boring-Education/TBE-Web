import mongoose from 'mongoose';

import { PrepLog, PrepYatraSubscription, Recruiter, User } from '@/database';
import type {
  AddPrepLogToDBPayloadProps,
  AddRecruiterToDBPayloadProps,
  DatabaseQueryResponseType,
} from '@/interfaces';

const getRecruitersByUserFromDB = async (
  userId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const recruiters = await Recruiter.find({
      user: new mongoose.Types.ObjectId(userId),
    }).sort({ updatedAt: -1 });
    return { data: recruiters };
  } catch (error) {
    return { error: 'Failed to fetch recruiters from DB' };
  }
};

const addRecruiterToDB = async (payload: AddRecruiterToDBPayloadProps): Promise<DatabaseQueryResponseType> => {
  try {
    const { userId, recruiterName, ...optionalFields } = payload;
    
    const recruiterData = {
      user: userId,
      recruiterName,
      ...optionalFields
    };

    const addRecruiter = new Recruiter(recruiterData);
    await addRecruiter.save();
    return { data: addRecruiter };
  } catch (error) {
    return { error: 'Error while saving recruiter to DB' };
  }
};

const updateRecruiterInDB = async (
  recruiterId: string,
  updatePayload: Partial<Record<string, any>>
): Promise<DatabaseQueryResponseType> => {
  try {
    const updatedRecruiter = await Recruiter.findByIdAndUpdate(
      recruiterId,
      updatePayload,
      { new: true }
    );

    if (!updatedRecruiter) {
      return { error: 'Recruiter not found' };
    }

    return { data: updatedRecruiter };
  } catch (error: any) {
    return { error: 'Failed to update recruiter' };
  }
};

const deleteRecruiterInDB = async (
  recruiterId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const deletedRecruiter = await Recruiter.findByIdAndDelete(recruiterId);

    if (!deletedRecruiter) {
      return { error: 'Recruiter not deleted' };
    }

    return { data: deletedRecruiter };
  } catch (error) {
    return { error: 'Failed to update recruiter: ' };
  }
};

const addPrepLogToDB = async ({
  userId,
  title,
  description,
  timeSpent,
}: AddPrepLogToDBPayloadProps): Promise<DatabaseQueryResponseType> => {
  try {
    const newLog = await PrepLog.create({
      user: userId,
      title,
      description,
      timeSpent,
    });
    return { data: newLog };
  } catch (error: any) {
    return { error: error.message };
  }
};

const getPrepLogsByUserFromDB = async (userId: string) => {
  try {
    const logs = await PrepLog.find({ user: userId }).sort({ createdAt: -1 });
    return { data: logs };
  } catch (error: any) {
    return { error: error.message };
  }
};

const updatePrepLogInDB = async (prepLogId: string, updateData: any) => {
  try {
    const updatedLog = await PrepLog.findByIdAndUpdate(prepLogId, updateData, {
      new: true,
    });

    if (!updatedLog) return { error: 'Prep log not found' };

    return { data: updatedLog };
  } catch (error: any) {
    return { error: error.message };
  }
};

const deletePrepLogInDB = async (prepLogId: string) => {
  try {
    const deletedLog = await PrepLog.findByIdAndDelete(prepLogId);

    if (!deletedLog) return { error: 'Log not found' };

    return { data: deletedLog };
  } catch (error: any) {
    return { error: error.message };
  }
};


const getActiveSubscriptionByUserFromDB = async (
  userId: string,
  subscriptionType: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const subscription = await PrepYatraSubscription.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      type: subscriptionType,
      isActive: true,
      expiryDate: { $gt: new Date() }
    });
    return { data: subscription };
  } catch (error) {
    return { error: 'Failed to fetch active subscription from DB' };
  }
};

const createSubscriptionInDB = async ({
  userId,
  type,
  amount,
  duration,
  expiryDate,
  features,
}: {
  userId: string;
  type: string;
  amount: number;
  duration: number;
  expiryDate: Date;
  features: string[];
}): Promise<DatabaseQueryResponseType> => {
  try {
    const subscription = await PrepYatraSubscription.create({
      userId: new mongoose.Types.ObjectId(userId),
      type,
      amount,
      duration,
      expiryDate,
      features,
      startDate: new Date(),
      isActive: true
    });
    return { data: subscription };
  } catch (error) {
    return { error: 'Failed to create subscription in DB' };
  }
};

const updateUserSubscriptionStatusInDB = async ({
  userId,
  subscriptionStatus,
  subscriptionExpiry,
}: {
  userId: string;
  subscriptionStatus: string;
  subscriptionExpiry: Date;
}): Promise<DatabaseQueryResponseType> => {
  try {
    const updatedUser = await User.updateOne(
      { mongoUserId: new mongoose.Types.ObjectId(userId) },
      {
        subscriptionStatus,
        subscriptionExpiry,
      }
    );
    return { data: updatedUser };
  } catch (error) {
    return { error: 'Failed to update user subscription status in DB' };
  }
};

const getPYUserByIdFromDB = async (userId: string): Promise<DatabaseQueryResponseType> => {
  try {
    const user = await User.findById(userId);
    return { data: user };
  } catch (error) {
    return { error: 'Failed to fetch user from DB' };
  }
};

const updatePYUserByIdInDB = async (
  userId: string,
  update: Record<string, any>,
  options: Record<string, any> = { new: true }
): Promise<DatabaseQueryResponseType> => {
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, update, options);
    return { data: updatedUser };
  } catch (error) {
    return { error: 'Failed to update user in DB' };
  }
};

export {
  addPrepLogToDB,
  addRecruiterToDB,
  createSubscriptionInDB,
  deletePrepLogInDB,
  deleteRecruiterInDB,
  getActiveSubscriptionByUserFromDB,
  getPrepLogsByUserFromDB,
  getRecruitersByUserFromDB,
  updatePrepLogInDB,
  updateRecruiterInDB,
  updateUserSubscriptionStatusInDB,
  getPYUserByIdFromDB,
  updatePYUserByIdInDB,
};
