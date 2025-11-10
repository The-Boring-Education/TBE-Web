import fs from "fs"
import path from "path"

import type {
    DatabaseQueryResponseType,
    LeaderboardModel,
    LeaderboardType
} from "@/lib/interfaces"

import { Gamification, Leaderboard } from "../models"

const addLeaderboardTopperToDB = async (
    payload: Omit<LeaderboardModel, "createdAt" | "updatedAt">
): Promise<DatabaseQueryResponseType> => {
    try {
        const data = await Leaderboard.create(payload)
        return { data }
    } catch (error: any) {
        return { error: error.message || "Error saving leaderboard winner" }
    }
}

const getLeaderboardEntriesFromDB = async (
    type?: LeaderboardType
): Promise<DatabaseQueryResponseType> => {
    try {
        const query = type ? { type } : {}
        const data = await Leaderboard.find(query).sort({ date: -1 })
        return { data }
    } catch (error: any) {
        return { error: error.message || "Error fetching leaderboard entries" }
    }
}

const saveLeaderboardToDB = async (
    type: LeaderboardType,
    entries: { userId: string; points: number }[]
): Promise<DatabaseQueryResponseType> => {
    try {
        const result = await Leaderboard.findOneAndUpdate(
            { type },
            { type, entries, date: new Date() },
            { upsert: true, new: true }
        )
        return { data: result }
    } catch (error: any) {
        return { error: error.message || "Failed to save leaderboard" }
    }
}

const getLeaderboardWithUsersFromDB = async (
    type: LeaderboardType
): Promise<DatabaseQueryResponseType> => {
    try {
        const data = await Leaderboard.findOne({ type })
            .sort({ date: -1 })
            .populate("entries.userId", "name image")
        return { data }
    } catch (error: any) {
        return {
            error: error.message || "Error fetching leaderboard with users"
        }
    }
}

const getStartDateByType = (type: LeaderboardType) => {
    const now = new Date()
    if (type === "DAILY") {
        now.setHours(0, 0, 0, 0)
    } else if (type === "WEEKLY") {
        const day = now.getDay()
        now.setDate(now.getDate() - day)
        now.setHours(0, 0, 0, 0)
    } else if (type === "MONTHLY") {
        now.setDate(1)
        now.setHours(0, 0, 0, 0)
    }
    return now
}

const generateLeaderboard = async (type: LeaderboardType) => {
    const startDate = getStartDateByType(type)
    const endDate = new Date()

    const gamificationData = await Gamification.find()

    const userScores: Record<string, number> = {}

    gamificationData.forEach((user) => {
        const actions = user.actions.filter(
            (a) =>
                a.createdAt !== undefined &&
                a.createdAt >= startDate &&
                a.createdAt <= endDate
        )

        const total = actions.reduce((sum, a) => sum + (a.pointsEarned || 0), 0)
        if (total > 0) {
            userScores[user.userId.toString()] =
                (userScores[user.userId.toString()] || 0) + total
        }
    })

    const sorted = Object.entries(userScores)
        .sort((a, b) => b[1] - a[1])
        .map(([userId, points]) => ({ userId, points }))

    const publicDir = path.join(process.cwd(), "public", "leaderboards")
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true })
    }

    fs.writeFileSync(
        path.join(publicDir, `${type.toLowerCase()}.json`),
        JSON.stringify(sorted, null, 2)
    )

    if (sorted.length > 0) {
        const top = sorted[0]
    }
    return sorted
}

export {
    addLeaderboardTopperToDB,
    generateLeaderboard,
    getLeaderboardEntriesFromDB,
    getLeaderboardWithUsersFromDB,
    saveLeaderboardToDB
}
