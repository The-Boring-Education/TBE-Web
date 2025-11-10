import type {
    CreateUserRequestPayloadProps,
    DatabaseQueryResponseType,
    PlatformUsageType,
    UserRoleType,
    WorkDomainType
} from "@/lib/interfaces"

import { User } from "../models"

const getUserByIdFromDB = async (
    id: string
): Promise<DatabaseQueryResponseType> => {
    try {
        const user = await User.findById(id)

        if (!user) return { error: "User does not exists" }

        return { data: user }
    } catch (error) {
        return { error: "Error while fetching user" }
    }
}

const getUserByEmailFromDB = async (
    email: string
): Promise<DatabaseQueryResponseType> => {
    try {
        const user = await User.findOne({ email })

        if (!user) return { error: "User does not exists" }

        return { data: user }
    } catch (error) {
        return { error: "Failed while fetching user" }
    }
}

const createUserInDB = async (
    userPayload: CreateUserRequestPayloadProps
): Promise<DatabaseQueryResponseType> => {
    try {
        const user = await User.create(userPayload)
        return { data: user }
    } catch (error) {
        return { error: "Failed while creating user" }
    }
}

const getUserByUserNameFromDB = async (
    userName: string
): Promise<DatabaseQueryResponseType> => {
    try {
        if (!userName) {
            return { error: "Username is required" }
        }

        const existingUser = await User.findOne({ userName })

        if (existingUser) {
            return { error: "Username already taken" }
        }

        return { data: true }
    } catch (error) {
        return { error: "An error occurred while checking the userName" }
    }
}

const onboardUserToDB = async (
    userId: string,
    userName: string,
    occupation: UserRoleType,
    purpose: PlatformUsageType[],
    contactNo: string,
    from?: string
): Promise<DatabaseQueryResponseType> => {
    try {
        const updateData: any = {
            userName,
            occupation,
            purpose,
            contactNo,
            isOnboarded: true
        }

        // Only add 'from' if it doesn't already exist
        if (from) {
            const existingUser = await User.findById(userId)
            if (!existingUser?.from) {
                updateData.from = from
            }
        }

        const user = await User.findByIdAndUpdate(userId, updateData, {
            new: true
        })

        if (!user) return { error: "User does not exist" }

        return { data: user }
    } catch (error) {
        return { error }
    }
}

const onboardPrepYatraUserTODB = async (
    userId: string,
    workDomain: WorkDomainType,
    linkedInUrl: string,
    from?: string
): Promise<DatabaseQueryResponseType> => {
    try {
        const updateData: any = {
            prepYatra: {
                workDomain,
                linkedInUrl,
                pyOnboarded: true
            }
        }

        // Only add 'from' if it doesn't already exist
        if (from) {
            const existingUser = await User.findById(userId)
            if (!existingUser?.from) {
                updateData.from = from
            }
        }

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true })

        if (!user) return { error: "User does not exist" }

        return { data: user }
    } catch (error) {
        return { error }
    }
}

const updateUserSkillsInDB = async (
    userId: string,
    userSkills: string[]
): Promise<DatabaseQueryResponseType> => {
    try {
        const user = await User.findOneAndUpdate(
            { _id: userId },
            {
                $addToSet: { userSkills: { $each: userSkills } },
                userSkillsLastUpdated: new Date()
            },
            { new: true }
        )
        if (!user) return { error: "User does not exist" }
        return { data: user }
    } catch (error) {
        return { error: "Failed to update user skills" }
    }
}

const getUserDataByUserNameFromDB = async (
    userName: string
): Promise<DatabaseQueryResponseType> => {
    try {
        const user = await User.findOne({ userName })
        return { data: user }
    } catch (error) {
        return { error: "Failed to fetch user from DB" }
    }
}

export {
    createUserInDB,
    getUserByEmailFromDB,
    getUserByIdFromDB,
    getUserByUserNameFromDB,
    getUserDataByUserNameFromDB,
    onboardPrepYatraUserTODB,
    onboardUserToDB,
    updateUserSkillsInDB}
