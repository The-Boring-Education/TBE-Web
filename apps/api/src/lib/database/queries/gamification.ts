import type {
  DatabaseQueryResponseType,
  UserPointsAction,
  UserPointsActionType,
} from "@/lib/interfaces";
import { calculateUserPointsForAction } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";

import { Gamification } from "../models";

const addGamificationDocInDB = async (
  userId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const gamification = new Gamification({ userId });
    await gamification.save();
    const doc = gamification.toObject();
    const { actions: _actions, ...data } = doc;
    return { data };
  } catch (error) {
    logger.error("DB: addGamificationDocInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to add gamification document", details: error };
  }
};

const getUserPointsFromDB = async (
  userId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const gamification = await Gamification.findOne({ userId: { $eq: userId } })
      .select("-actions")
      .lean();

    if (!gamification) {
      return { error: "User not found" };
    }

    return { data: gamification };
  } catch (error) {
    logger.error("DB: getUserPointsFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Error fetching user points", details: error };
  }
};

const updateUserPointsInDB = async (
  userId: string,
  actionType: UserPointsActionType,
): Promise<DatabaseQueryResponseType> => {
  try {
    const pointsEarned = calculateUserPointsForAction(actionType);

    const action: UserPointsAction = {
      actionType,
      pointsEarned,
    };

    const updatedGamification = await Gamification.findOneAndUpdate(
      { userId },
      {
        $push: { actions: action },
        $inc: { points: pointsEarned },
      },
      { new: true, select: "-actions" },
    );

    if (!updatedGamification) {
      return { error: "User not found" };
    }

    return { data: updatedGamification };
  } catch (error) {
    logger.error("DB: updateUserPointsInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Error updating user points", details: error };
  }
};

const deductUserPointsFromDB = async (
  userId: string,
  actionType: UserPointsActionType,
): Promise<DatabaseQueryResponseType> => {
  try {
    const pointsToDeduct = calculateUserPointsForAction(actionType);

    const updatedGamification = await Gamification.findOneAndUpdate(
      { userId },
      [
        {
          $set: {
            points: {
              $max: [{ $subtract: ["$points", pointsToDeduct] }, 0],
            },
          },
        },
      ],
      { new: true, select: "-actions" },
    );

    if (!updatedGamification) {
      return { error: "User not found" };
    }

    return { data: updatedGamification };
  } catch (error) {
    logger.error("DB: deductUserPointsFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Error reducing points", details: error };
  }
};

const handleGamificationPoints = async (
  isCompleted: boolean,
  userId: string,
  actionType: UserPointsActionType,
): Promise<DatabaseQueryResponseType> => {
  try {
    const { error, data } = isCompleted
      ? await updateUserPointsInDB(userId, actionType)
      : await deductUserPointsFromDB(userId, actionType);

    if (error)
      return {
        error: "Gamification action failed",
      };

    return {
      data,
    };
  } catch (error) {
    logger.error("DB: handleGamificationPoints failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Unexpected error in handleGamificationPoints",
      details: error,
    };
  }
};

const getLeaderboardFromDB = async (
  limit = 10,
): Promise<DatabaseQueryResponseType> => {
  try {
    const leaderboard = await Gamification.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          userId: 1,
          points: 1,
          "user.name": 1,
          "user.image": 1,
          "user.email": 1,
        },
      },
      { $sort: { points: -1 } },
      { $limit: limit },
    ]);

    return { data: leaderboard };
  } catch (error) {
    logger.error("DB: getLeaderboardFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Error fetching leaderboard", details: error };
  }
};

const getActionsWithinDateRange = async (
  start: Date,
  end: Date,
): Promise<DatabaseQueryResponseType> => {
  try {
    const data = await Gamification.find({
      createdAt: { $gte: start, $lte: end },
    }).lean();
    return { data };
  } catch (error) {
    logger.error("DB: getActionsWithinDateRange failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed to fetch actions within date range",
      details: error,
    };
  }
};

export {
  addGamificationDocInDB,
  getActionsWithinDateRange,
  getLeaderboardFromDB,
  getUserPointsFromDB,
  handleGamificationPoints,
  updateUserPointsInDB,
};
