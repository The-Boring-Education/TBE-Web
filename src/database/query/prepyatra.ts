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

const addRecruiterToDB = async (
  payload: AddRecruiterToDBPayloadProps
): Promise<DatabaseQueryResponseType> => {
  try {
    const { userId, recruiterName, ...optionalFields } = payload;

    const recruiterData = {
      user: userId,
      recruiterName,
      ...optionalFields,
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

    // Update user prep log streak tracking
    await updateUserPrepLogStreak(userId);

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
      expiryDate: { $gt: new Date() },
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
      isActive: true,
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
      { userId: new mongoose.Types.ObjectId(userId) },
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

const getPYUserByIdFromDB = async (
  userId: string
): Promise<DatabaseQueryResponseType> => {
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

const updateUserPrepLogStreak = async (
  userId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { error: 'User not found' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastLoggedDate = user.prepYatra?.prepLog?.lastLoggedDate 
      ? new Date(user.prepYatra.prepLog.lastLoggedDate) 
      : null;

    let currentStreak = user.prepYatra?.prepLog?.currentStreak || 0;
    let longestStreak = user.prepYatra?.prepLog?.longestStreak || 0;
    const totalLogs = (user.prepYatra?.prepLog?.totalLogs || 0) + 1;

    // Check if user already logged today
    if (lastLoggedDate && lastLoggedDate >= today) {
      // Already logged today, just increment total logs
      await User.findByIdAndUpdate(userId, {
        'prepYatra.prepLog.totalLogs': totalLogs,
      });
      return { data: { message: 'Already logged today' } };
    }

    const previousStreak = currentStreak;

    // Check if this continues a streak
    if (lastLoggedDate && lastLoggedDate >= yesterday) {
      currentStreak += 1;
    } else {
      // Starting new streak
      currentStreak = 1;
    }

    // Update longest streak if current is higher
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    // Update user with new streak data
    await User.findByIdAndUpdate(userId, {
      'prepYatra.prepLog.currentStreak': currentStreak,
      'prepYatra.prepLog.longestStreak': longestStreak,
      'prepYatra.prepLog.lastLoggedDate': today,
      'prepYatra.prepLog.totalLogs': totalLogs,
    }, { new: true });

    // Award bonus points for streak milestones
    const streakMilestones = [3, 7, 15, 30];
    for (const milestone of streakMilestones) {
      if (currentStreak === milestone && previousStreak < milestone) {
        try {
          const { handleGamificationPoints } = await import('./gamification');
          await handleGamificationPoints(true, userId, `PREPLOG_STREAK_${milestone}` as any);
        } catch (gamificationError) {
          console.error('Gamification streak reward failed:', gamificationError);
        }
      }
    }

    return { data: { currentStreak, longestStreak, totalLogs, streakMilestone: currentStreak } };
  } catch (error: any) {
    return { error: error.message };
  }
};

const getUserPrepLogStats = async (
  userId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { error: 'User not found' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const prepLogStats = user.prepYatra?.prepLog || {
      currentStreak: 0,
      longestStreak: 0,
      lastLoggedDate: null,
      totalLogs: 0,
    };

    // Check if user has logged today
    const hasLoggedToday = prepLogStats.lastLoggedDate 
      ? new Date(prepLogStats.lastLoggedDate) >= today 
      : false;

    // Get recent logs for the past 7 days
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const recentLogs = await PrepLog.find({
      user: userId,
      createdAt: { $gte: sevenDaysAgo },
    }).sort({ createdAt: -1 });

    return {
      data: {
        ...prepLogStats,
        hasLoggedToday,
        recentLogs: recentLogs.length,
        weeklyLogs: recentLogs,
      },
    };
  } catch (error: any) {
    return { error: error.message };
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
  getPYUserByIdFromDB,
  getRecruitersByUserFromDB,
  getUserPrepLogStats,
  updatePrepLogInDB,
  updatePYUserByIdInDB,
  updateRecruiterInDB,
  updateUserPrepLogStreak,
  updateUserSubscriptionStatusInDB,
};
