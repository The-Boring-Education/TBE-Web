import mongoose from "mongoose";

import type {
  AddPrepLogToDBPayloadProps,
  AddRecruiterToDBPayloadProps,
  DatabaseQueryResponseType,
} from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import {
  Challenge,
  ChallengeLog,
  Mentorship,
  PrepLog,
  Recruiter,
  Subscription,
  User,
} from "../models";

const getRecruitersByUserFromDB = async (
  userId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const recruiters = await Recruiter.find({
      user: new mongoose.Types.ObjectId(userId),
    }).sort({ updatedAt: -1 });
    return { data: recruiters };
  } catch (error) {
    return { error: "Failed to fetch recruiters from DB" };
  }
};

const addRecruiterToDB = async (
  payload: AddRecruiterToDBPayloadProps,
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
    return { error: "Error while saving recruiter to DB" };
  }
};

const updateRecruiterInDB = async (
  recruiterId: string,
  updatePayload: Partial<Record<string, any>>,
): Promise<DatabaseQueryResponseType> => {
  try {
    const updatedRecruiter = await Recruiter.findByIdAndUpdate(
      recruiterId,
      updatePayload,
      { new: true },
    );

    if (!updatedRecruiter) {
      return { error: "Recruiter not found" };
    }

    return { data: updatedRecruiter };
  } catch (error: any) {
    return { error: "Failed to update recruiter" };
  }
};

const deleteRecruiterInDB = async (
  recruiterId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const deletedRecruiter = await Recruiter.findByIdAndDelete(recruiterId);

    if (!deletedRecruiter) {
      return { error: "Recruiter not deleted" };
    }

    return { data: deletedRecruiter };
  } catch (error) {
    return { error: "Failed to update recruiter: " };
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
    const logs = await PrepLog.find({ user: userId }).sort({
      createdAt: 1,
    });
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

    if (!updatedLog) return { error: "Prep log not found" };

    return { data: updatedLog };
  } catch (error: any) {
    return { error: error.message };
  }
};

const deletePrepLogInDB = async (prepLogId: string) => {
  try {
    const deletedLog = await PrepLog.findByIdAndDelete(prepLogId);

    if (!deletedLog) return { error: "Log not found" };

    try {
      await recalculateUserPrepLogStats(deletedLog.user.toString());
    } catch (recalcError) {
      logger.error("Failed to recalculate user stats after deletion", {
        error:
          recalcError instanceof Error
            ? recalcError.message
            : String(recalcError),
      });
      // Don't fail the deletion if recalculation fails
    }

    return { data: deletedLog };
  } catch (error: any) {
    return { error: error.message };
  }
};

const getActiveSubscriptionByUserFromDB = async (
  userId: string,
  subscriptionType: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const subscription = await Subscription.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      type: subscriptionType,
      isActive: true,
      expiryDate: { $gt: new Date() },
    });
    return { data: subscription };
  } catch (error) {
    return { error: "Failed to fetch active subscription from DB" };
  }
};

const createSubscriptionInDB = async ({
  userId,
  type,
  productType,
  amount,
  duration,
  expiryDate,
  features,
}: {
  userId: string;
  type: string;
  productType?: string;
  amount: number;
  duration: number;
  expiryDate: Date;
  features: string[];
}): Promise<DatabaseQueryResponseType> => {
  try {
    const subscription = await Subscription.create({
      userId: new mongoose.Types.ObjectId(userId),
      type,
      ...(productType && { productType }),
      amount,
      duration,
      expiryDate,
      features,
      startDate: new Date(),
      isActive: true,
    });
    return { data: subscription };
  } catch (error) {
    return { error: "Failed to create subscription in DB" };
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
      },
    );
    return { data: updatedUser };
  } catch (error) {
    return { error: "Failed to update user subscription status in DB" };
  }
};

const getPYUserByIdFromDB = async (
  userId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const user = await User.findById(userId);
    return { data: user };
  } catch (error) {
    return { error: "Failed to fetch user from DB" };
  }
};

const updatePYUserByIdInDB = async (
  userId: string,
  update: Record<string, any>,
  options: Record<string, any> = { new: true },
): Promise<DatabaseQueryResponseType> => {
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, update, options);
    return { data: updatedUser };
  } catch (error) {
    return { error: "Failed to update user in DB" };
  }
};

const updateUserPrepLogStreak = async (
  userId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { error: "User not found" };
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
        "prepYatra.prepLog.totalLogs": totalLogs,
      });
      return { data: { message: "Already logged today" } };
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
    await User.findByIdAndUpdate(
      userId,
      {
        "prepYatra.prepLog.currentStreak": currentStreak,
        "prepYatra.prepLog.longestStreak": longestStreak,
        "prepYatra.prepLog.lastLoggedDate": today,
        "prepYatra.prepLog.totalLogs": totalLogs,
      },
      { new: true },
    );

    // Award bonus points for streak milestones
    const streakMilestones = [3, 7, 15, 30];
    for (const milestone of streakMilestones) {
      if (currentStreak === milestone && previousStreak < milestone) {
        try {
          const { handleGamificationPoints } = await import("./gamification");
          await handleGamificationPoints(
            true,
            userId,
            `PREPLOG_STREAK_${milestone}` as any,
          );
        } catch (gamificationError) {
          logger.error("Gamification streak reward failed", {
            error:
              gamificationError instanceof Error
                ? gamificationError.message
                : String(gamificationError),
          });
        }
      }
    }

    return {
      data: {
        currentStreak,
        longestStreak,
        totalLogs,
        streakMilestone: currentStreak,
      },
    };
  } catch (error: any) {
    return { error: error.message };
  }
};

const getUserPrepLogStats = async (
  userId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { error: "User not found" };
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

const recalculateUserPrepLogStats = async (
  userId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { error: "User not found" };
    }

    // Get all prep logs for the user, sorted by creation date
    const allLogs = await PrepLog.find({ user: userId }).sort({
      createdAt: 1,
    });

    if (allLogs.length === 0) {
      // No logs left, reset all stats to zero
      await User.findByIdAndUpdate(userId, {
        "prepYatra.prepLog.currentStreak": 0,
        "prepYatra.prepLog.longestStreak": 0,
        "prepYatra.prepLog.lastLoggedDate": null,
        "prepYatra.prepLog.totalLogs": 0,
      });
      return { data: { message: "Stats reset to zero" } };
    }

    // Calculate total logs
    const totalLogs = allLogs.length;

    // Group logs by date to calculate streaks
    const logsByDate = new Map<string, number>();
    allLogs.forEach((log) => {
      const createdAt = (log as any).createdAt;
      if (createdAt) {
        const dateKey = new Date(createdAt).toISOString().split("T")[0];
        if (dateKey) {
          logsByDate.set(dateKey, (logsByDate.get(dateKey) || 0) + 1);
        }
      }
    });

    // Get sorted unique dates
    const sortedDates = Array.from(logsByDate.keys()).sort();

    // Calculate current streak (from most recent date backwards)
    let currentStreak = 0;
    let longestStreak = 0;
    let lastLoggedDate: Date | null = null;

    if (sortedDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayKey = today.toISOString().split("T")[0];

      // Set last logged date to the most recent date
      const lastDate = sortedDates[sortedDates.length - 1];
      if (lastDate) {
        lastLoggedDate = new Date(lastDate);
      }

      // Calculate current streak
      let streakCount = 0;
      const currentDate = new Date(today);

      // Check if user logged today
      if (todayKey && sortedDates.includes(todayKey)) {
        streakCount = 1;
        currentDate.setDate(currentDate.getDate() - 1);
      }

      // Continue counting backwards
      while (currentDate >= new Date("1900-01-01")) {
        const dateKey = currentDate.toISOString().split("T")[0];
        if (dateKey && sortedDates.includes(dateKey)) {
          streakCount++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }

      currentStreak = streakCount;

      // Calculate longest streak
      let maxStreak = 0;
      let tempStreak = 0;
      let previousDate: Date | null = null;

      for (const dateKey of sortedDates) {
        const currentDate = new Date(dateKey);

        if (previousDate) {
          const dayDiff = Math.floor(
            (currentDate.getTime() - previousDate.getTime()) /
              (1000 * 60 * 60 * 24),
          );

          if (dayDiff === 1) {
            // Consecutive day
            tempStreak++;
          } else {
            // Streak broken
            maxStreak = Math.max(maxStreak, tempStreak);
            tempStreak = 1;
          }
        } else {
          tempStreak = 1;
        }

        previousDate = currentDate;
      }

      // Check the last streak
      maxStreak = Math.max(maxStreak, tempStreak);
      longestStreak = maxStreak;
    }

    // Update user with recalculated stats
    await User.findByIdAndUpdate(
      userId,
      {
        "prepYatra.prepLog.currentStreak": currentStreak,
        "prepYatra.prepLog.longestStreak": longestStreak,
        "prepYatra.prepLog.lastLoggedDate": lastLoggedDate,
        "prepYatra.prepLog.totalLogs": totalLogs,
      },
      { new: true },
    );

    return {
      data: {
        currentStreak,
        longestStreak,
        totalLogs,
        lastLoggedDate,
      },
    };
  } catch (error: any) {
    return { error: error.message };
  }
};

const getAllUsersWithLogsFromDB =
  async (): Promise<DatabaseQueryResponseType> => {
    try {
      // Fetch only PrepYatra onboarded users
      const users = await User.find({ "prepYatra.pyOnboarded": true })
        .select("_id name email userName image prepYatra createdAt")
        .sort({ createdAt: -1 })
        .lean();

      // Fetch all prep logs
      const logs = await PrepLog.find().sort({ createdAt: -1 }).lean();

      // Map userId to logs
      const logsMap: Record<string, any[]> = {};
      for (const log of logs) {
        const uid = String(log.user);
        if (!logsMap[uid]) logsMap[uid] = [];
        logsMap[uid]!.push(log);
      }

      // Attach logs and stats to each user
      const usersWithLogs = users.map((user) => ({
        ...user,
        logs: logsMap[user._id.toString()] || [],
        totalLogs: logsMap[user._id.toString()]?.length || 0,
        prepLogStats: user.prepYatra?.prepLog || {
          currentStreak: 0,
          longestStreak: 0,
          lastLoggedDate: null,
          totalLogs: 0,
        },
      }));

      return {
        data: {
          users: usersWithLogs,
          totalUsers: usersWithLogs.length,
        },
      };
    } catch (error: any) {
      return { error: error.message };
    }
  };

// Mentorship helper queries
const getAllMenteesFromDB = async (): Promise<DatabaseQueryResponseType> => {
  try {
    const mentees = await Mentorship.find()
      .populate("user", "_id name email userName image prepYatra createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const userIds = mentees.map((m: any) => String(m.user._id));
    const logs = await PrepLog.find({ user: { $in: userIds } })
      .sort({ createdAt: -1 })
      .lean();

    const logsMap: Record<string, any[]> = {};
    for (const log of logs) {
      const uid = String(log.user);
      if (!logsMap[uid]) logsMap[uid] = [];
      logsMap[uid]!.push(log);
    }

    const menteesWithDetails = mentees.map((m: any) => {
      const user = m.user;
      return {
        ...user,
        logs: logsMap[user._id.toString()] || [],
        totalLogs: logsMap[user._id.toString()]?.length || 0,
        prepLogStats: user.prepYatra?.prepLog || {
          currentStreak: 0,
          longestStreak: 0,
          lastLoggedDate: null,
          totalLogs: 0,
        },
        mentorshipSelectedAt: m.selectedAt,
        mentorshipNote: m.note,
      };
    });

    return {
      data: {
        mentees: menteesWithDetails,
        totalMentees: menteesWithDetails.length,
      },
    };
  } catch (error: any) {
    return { error: error.message };
  }
};

const isUserMenteeInDB = async (
  userId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const existing = await Mentorship.findOne({ user: userId });
    return { data: { isMentee: !!existing } };
  } catch (error: any) {
    return { error: error.message };
  }
};

const toggleMentorshipInDB = async (
  userId: string,
  isSelected: boolean,
  note?: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    if (isSelected) {
      const existing = await Mentorship.findOne({ user: userId });
      if (existing) {
        existing.note = note || existing.note;
        existing.selectedAt = new Date();
        await existing.save();
        return { data: existing };
      }
      const created = await Mentorship.create({ user: userId, note });
      return { data: created };
    } else {
      const deleted = await Mentorship.findOneAndDelete({ user: userId });
      return { data: deleted };
    }
  } catch (error: any) {
    return { error: error.message };
  }
};

// Challenge Functions
const getChallengesByUserFromDB = async (
  userId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const challenges = await Challenge.find({
      user: new mongoose.Types.ObjectId(userId),
    }).sort({ createdAt: -1 });
    return { data: challenges };
  } catch (error) {
    return { error: "Failed to fetch challenges from DB" };
  }
};

const createChallengeInDB = async (payload: {
  userId: string;
  name: string;
  description?: string;
  totalDays: number;
  isPredefined: boolean;
  predefinedType?: string;
}): Promise<DatabaseQueryResponseType> => {
  try {
    const challengeData = {
      user: new mongoose.Types.ObjectId(payload.userId),
      name: payload.name,
      description: payload.description,
      totalDays: payload.totalDays,
      isPredefined: payload.isPredefined,
      predefinedType: payload.predefinedType,
      startDate: new Date(),
      gamificationPoints: 0,
    };

    const newChallenge = new Challenge(challengeData);
    await newChallenge.save();
    return { data: newChallenge };
  } catch (error: any) {
    return {
      error: error.message || "Error while creating challenge in DB",
    };
  }
};

const updateChallengeInDB = async (
  challengeId: string,
  updatePayload: Partial<Record<string, any>>,
): Promise<DatabaseQueryResponseType> => {
  try {
    const updatedChallenge = await Challenge.findByIdAndUpdate(
      challengeId,
      updatePayload,
      { new: true },
    );

    if (!updatedChallenge) {
      return { error: "Challenge not found" };
    }

    return { data: updatedChallenge };
  } catch (error: any) {
    return { error: "Failed to update challenge" };
  }
};

const deleteChallengeInDB = async (
  challengeId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    // Delete all associated logs first
    await ChallengeLog.deleteMany({ challenge: challengeId });

    const deletedChallenge = await Challenge.findByIdAndDelete(challengeId);

    if (!deletedChallenge) {
      return { error: "Challenge not found" };
    }

    return { data: deletedChallenge };
  } catch (error) {
    return { error: "Failed to delete challenge" };
  }
};

const getChallengeLogsByIdFromDB = async (
  challengeId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const logs = await ChallengeLog.find({
      challenge: new mongoose.Types.ObjectId(challengeId),
    }).sort({ day: 1 });
    return { data: logs };
  } catch (error) {
    return { error: "Failed to fetch challenge logs from DB" };
  }
};

const createChallengeLogInDB = async (payload: {
  challengeId: string;
  userId: string;
  progressText: string;
  hoursSpent: number;
  copyToPrepLogs?: boolean;
}): Promise<DatabaseQueryResponseType> => {
  try {
    // Get the challenge to determine the next day
    const challenge = await Challenge.findById(payload.challengeId);
    if (!challenge) {
      return { error: "Challenge not found" };
    }

    const nextDay = challenge.currentDay + 1;

    // Check if this day has already been logged
    const existingLog = await ChallengeLog.findOne({
      challenge: payload.challengeId,
      day: nextDay,
    });

    if (existingLog) {
      return { error: "This day has already been logged" };
    }

    // Create the challenge log
    const logData = {
      challenge: new mongoose.Types.ObjectId(payload.challengeId),
      user: new mongoose.Types.ObjectId(payload.userId),
      day: nextDay,
      progressText: payload.progressText,
      hoursSpent: payload.hoursSpent,
      date: new Date(),
      copiedToPrepLogs: payload.copyToPrepLogs || false,
      gamificationPoints: 10, // Base points for logging
    };

    const newLog = new ChallengeLog(logData);
    await newLog.save();

    // Update challenge current day
    await Challenge.findByIdAndUpdate(payload.challengeId, {
      currentDay: nextDay,
      $inc: { gamificationPoints: 10 },
      ...(nextDay >= challenge.totalDays && {
        status: "completed",
        endDate: new Date(),
      }),
    });

    // Copy to prep logs if requested
    if (payload.copyToPrepLogs) {
      const prepLogData = {
        userId: payload.userId,
        title: `${challenge.name} - Day ${nextDay}`,
        description: payload.progressText,
        timeSpent: payload.hoursSpent,
      };

      const prepLogResult = await addPrepLogToDB(prepLogData);
      if (prepLogResult.data) {
        await ChallengeLog.findByIdAndUpdate(newLog._id, {
          prepLogId: prepLogResult.data._id,
        });
      }
    }

    return { data: newLog };
  } catch (error: any) {
    return {
      error: error.message || "Error while creating challenge log in DB",
    };
  }
};

const getChallengeProgressFromDB = async (
  challengeId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return { error: "Challenge not found" };
    }

    const logs = await ChallengeLog.find({
      challenge: new mongoose.Types.ObjectId(challengeId),
    }).sort({ day: 1 });

    const totalHoursSpent = logs.reduce((sum, log) => sum + log.hoursSpent, 0);
    const averageHoursPerDay =
      logs.length > 0 ? totalHoursSpent / logs.length : 0;
    const completionPercentage = Math.round(
      (challenge.currentDay / challenge.totalDays) * 100,
    );
    const daysRemaining = Math.max(
      0,
      challenge.totalDays - challenge.currentDay,
    );

    // Calculate streak (consecutive days without gaps)
    let streak = 0;
    const sortedLogs = logs.sort((a, b) => a.day - b.day);
    for (let i = 0; i < sortedLogs.length; i++) {
      const currentLog = sortedLogs[i];
      const previousLog = i > 0 ? sortedLogs[i - 1] : null;
      if (
        i === 0 ||
        (currentLog && previousLog && currentLog.day === previousLog.day + 1)
      ) {
        streak++;
      } else {
        streak = 1;
      }
    }

    const progressData = {
      challenge,
      logs,
      completionPercentage,
      daysRemaining,
      streak,
      totalHoursSpent,
      averageHoursPerDay,
    };

    return { data: progressData };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch challenge progress" };
  }
};

// Challenge Stats Functions
const getChallengeStatsFromDB =
  async (): Promise<DatabaseQueryResponseType> => {
    try {
      const [
        totalChallenges,
        activeChallenges,
        completedChallenges,
        totalUsers,
        totalLogs,
      ] = await Promise.all([
        Challenge.countDocuments(),
        Challenge.countDocuments({ status: "active" }),
        Challenge.countDocuments({ status: "completed" }),
        Challenge.distinct("user").then((users) => users.length),
        ChallengeLog.countDocuments(),
      ]);

      // Get popular challenge types
      const popularTypes = await Challenge.aggregate([
        { $match: { isPredefined: true } },
        { $group: { _id: "$predefinedType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]);

      // Get recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentActivity = await ChallengeLog.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
      });

      const stats = {
        totalChallenges,
        activeChallenges,
        completedChallenges,
        totalUsers,
        totalLogs,
        popularTypes,
        recentActivity,
      };

      return { data: stats };
    } catch (error: any) {
      return { error: error.message || "Failed to fetch challenge stats" };
    }
  };

export {
  addPrepLogToDB,
  addRecruiterToDB,
  createChallengeInDB,
  createChallengeLogInDB,
  createSubscriptionInDB,
  deleteChallengeInDB,
  deletePrepLogInDB,
  deleteRecruiterInDB,
  getActiveSubscriptionByUserFromDB,
  getAllMenteesFromDB,
  getAllUsersWithLogsFromDB,
  getChallengeLogsByIdFromDB,
  getChallengeProgressFromDB,
  getChallengesByUserFromDB,
  getChallengeStatsFromDB,
  getPrepLogsByUserFromDB,
  getPYUserByIdFromDB,
  getRecruitersByUserFromDB,
  getUserPrepLogStats,
  isUserMenteeInDB,
  recalculateUserPrepLogStats,
  toggleMentorshipInDB,
  updateChallengeInDB,
  updatePrepLogInDB,
  updatePYUserByIdInDB,
  updateRecruiterInDB,
  updateUserPrepLogStreak,
  updateUserSubscriptionStatusInDB,
};
