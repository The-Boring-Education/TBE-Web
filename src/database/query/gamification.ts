import { Gamification } from '@/database';
import { POINTS_RULES } from '@/constant';
import {
  UserPointsAction,
  UserPointsActionType,
  DatabaseQueryResponseType,
} from '@/interfaces';

const updateGamificationRecord = async (userId: string, actionType: string) => {
  try {
    console.log('Received ActionType:', actionType);

    let gamification = await Gamification.findOne({ userId });

    if (!gamification) {
      gamification = new Gamification({ userId, points: 0, actions: [] });
    }

    const pointsEarned =
      POINTS_RULES[actionType.toUpperCase() as UserPointsActionType] || 0;
    console.log(pointsEarned);

    const action: UserPointsAction = {
      actionType,
      pointsEarned,
    };

    gamification.actions.push(action);
    gamification.points += pointsEarned;
    await gamification.save();

    return { success: true, points: gamification.points };
  } catch (error) {
    console.error('Gamification Error:', error);
    return { success: false, message: error };
  }
};

const getUserPointFromDB = async (
  userId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const gamification = await Gamification.findOne({ userId });

    if (!gamification) {
      return { error: 'User Data not found' };
    }

    return { data: gamification };
  } catch (error) {
    return { error: 'Error fetching user points' };
  }
};

export { updateGamificationRecord, getUserPointFromDB };
