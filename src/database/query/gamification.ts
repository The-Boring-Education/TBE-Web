import { Gamification } from '@/database';
import type {
  DatabaseQueryResponseType,
  UserPointsAction,
  UserPointsActionType,
} from '@/interfaces';
import { calculateUserPointsForAction } from '@/utils';

const addGamificationDocInDB = async (
  userId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const gamification = new Gamification({ userId });
    await gamification.save();
    return { data: gamification };
  } catch (error) {
    return { error };
  }
};

const getUserPointsFromDB = async (
  userId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const gamification = await Gamification.findOne({ userId });

    if (!gamification) {
      return { error: 'User not found' };
    }

    return { data: gamification };
  } catch (error) {
    return { error: 'Error fetching user points' };
  }
};

const updateUserPointsInDB = async (
  userId: string,
  actionType: UserPointsActionType
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
      { new: true }
    );

    if (!updatedGamification) {
      return { error: 'User not found' };
    }

    return { data: updatedGamification };
  } catch (error) {
    return { error: 'Error updating user points' };
  }
};

const deductUserPointsFromDB = async (
  userId: string,
  actionType: UserPointsActionType
): Promise<DatabaseQueryResponseType> => {
  try {
    const pointsToDeduct = calculateUserPointsForAction(actionType);

    const updatedGamification = await Gamification.findOneAndUpdate(
      { userId },
      [
        {
          $set: {
            points: {
              $max: [{ $subtract: ['$points', pointsToDeduct] }, 0],
            },
          },
        },
      ],
      { new: true }
    );

    if (!updatedGamification) {
      return { error: 'User not found' };
    }

    return { data: updatedGamification };
  } catch (error) {
    return { error: 'Error reducing points' };
  }
};

const handleGamificationPoints = async (
  isCompleted: boolean,
  userId: string,
  actionType: UserPointsActionType
): Promise<DatabaseQueryResponseType> => {
  try {
    const { error, data } = isCompleted
      ? await updateUserPointsInDB(userId, actionType)
      : await deductUserPointsFromDB(userId, actionType);

    if (error)
      return {
        error: 'Gamification action failed',
      };

    return {
      data,
    };
  } catch (error) {
    return { error: 'Unexpected error in handleGamificationPoints' };
  }
};

export {
  addGamificationDocInDB,
  getUserPointsFromDB,
  handleGamificationPoints,
  updateUserPointsInDB,
};
