import { Gamification } from "../models"
import type {
    DatabaseQueryResponseType,
    UserPointsAction,
    UserPointsActionType
} from "@/lib/interfaces"
import { calculateUserPointsForAction } from "@/lib/utils"

const addGamificationDocInDB = async (
    userId: string
): Promise<DatabaseQueryResponseType> => {
    try {
        const gamification = new Gamification({ userId })
        await gamification.save()
        return { data: gamification }
    } catch (error) {
        return { error }
    }
}

const getUserPointsFromDB = async (
    userId: string
): Promise<DatabaseQueryResponseType> => {
    try {
        const gamification = await Gamification.findOne({ userId })

        if (!gamification) {
            return { error: "User not found" }
        }

        return { data: gamification }
    } catch (error) {
        return { error: "Error fetching user points" }
    }
}

const updateUserPointsInDB = async (
    userId: string,
    actionType: UserPointsActionType
): Promise<DatabaseQueryResponseType> => {
    try {
        const pointsEarned = calculateUserPointsForAction(actionType)

        const action: UserPointsAction = {
            actionType,
            pointsEarned
        }

        const updatedGamification = await Gamification.findOneAndUpdate(
            { userId },
            {
                $push: { actions: action },
                $inc: { points: pointsEarned }
            },
            { new: true }
        )

        if (!updatedGamification) {
            return { error: "User not found" }
        }

        return { data: updatedGamification }
    } catch (error) {
        return { error: "Error updating user points" }
    }
}

const deductUserPointsFromDB = async (
    userId: string,
    actionType: UserPointsActionType
): Promise<DatabaseQueryResponseType> => {
    try {
        const pointsToDeduct = calculateUserPointsForAction(actionType)

        const updatedGamification = await Gamification.findOneAndUpdate(
            { userId },
            [
                {
                    $set: {
                        points: {
                            $max: [
                                { $subtract: ["$points", pointsToDeduct] },
                                0
                            ]
                        }
                    }
                }
            ],
            { new: true }
        )

        if (!updatedGamification) {
            return { error: "User not found" }
        }

        return { data: updatedGamification }
    } catch (error) {
        return { error: "Error reducing points" }
    }
}

const handleGamificationPoints = async (
    isCompleted: boolean,
    userId: string,
    actionType: UserPointsActionType
): Promise<DatabaseQueryResponseType> => {
    try {
        const { error, data } = isCompleted
            ? await updateUserPointsInDB(userId, actionType)
            : await deductUserPointsFromDB(userId, actionType)

        if (error)
            return {
                error: "Gamification action failed"
            }

        return {
            data
        }
    } catch (error) {
        return { error: "Unexpected error in handleGamificationPoints" }
    }
}

const getLeaderboardFromDB = async (
    limit = 10
): Promise<DatabaseQueryResponseType> => {
    try {
        const leaderboard = await Gamification.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    userId: 1,
                    points: 1,
                    "user.name": 1,
                    "user.image": 1,
                    "user.email": 1
                }
            },
            { $sort: { points: -1 } },
            { $limit: limit }
        ])

        return { data: leaderboard }
    } catch (error) {
        return { error: "Error fetching leaderboard" }
    }
}

const getActionsWithinDateRange = async (
    start: Date,
    end: Date
): Promise<DatabaseQueryResponseType> =>
    await Gamification.find({
        createdAt: { $gte: start, $lte: end }
    }).lean()

export {
    addGamificationDocInDB,
    getActionsWithinDateRange,
    getLeaderboardFromDB,
    getUserPointsFromDB,
    handleGamificationPoints,
    updateUserPointsInDB
}
