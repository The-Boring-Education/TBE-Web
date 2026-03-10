import mongoose from "mongoose"

import type { DatabaseQueryResponseType } from "@/lib/interfaces"

import { User } from "../models"

const getDYUserByIdFromDB = async (
    userId: string
): Promise<DatabaseQueryResponseType> => {
    try {
        const user = await User.findById(userId)
        return { data: user }
    } catch (error) {
        return { error: "Failed to fetch user from DB" }
    }
}

const updateDYUserByIdInDB = async (
    userId: string,
    update: Record<string, any>,
    options: Record<string, any> = { new: true }
): Promise<DatabaseQueryResponseType> => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            update,
            options
        )
        return { data: updatedUser }
    } catch (error) {
        return { error: "Failed to update user in DB" }
    }
}

export { getDYUserByIdFromDB, updateDYUserByIdInDB }
