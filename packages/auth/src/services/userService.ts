import axios from "axios"
import type { CreateUserData } from "../types"

/**
 * Get the API URL from environment variables
 */
const getApiUrl = () => {
    const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.API_URL ||
        process.env.VITE_BASE_API_URL

    if (!apiUrl) {
        throw new Error("API URL is not configured in environment variables")
    }

    return apiUrl
}

/**
 * Create or find a user in the database
 * @param userData - User data to create
 * @returns User data from API
 */
export const createOrFindUser = async (
    userData: CreateUserData
): Promise<{ _id: string; [key: string]: any }> => {
    try {
        const apiUrl = getApiUrl()

        const response = await axios.post(`${apiUrl}/user`, {
            name: userData.name,
            email: userData.email,
            image: userData.image,
            provider: userData.provider,
            providerAccountId: userData.providerAccountId
        })

        const result = response.data

        if (result.status && result.data) {
            return result.data
        }

        throw new Error("Failed to create or find user")
    } catch (error) {
        console.error("Error in createOrFindUser:", error)
        throw error
    }
}

/**
 * Get user by email
 * @param email - User email address
 * @returns User data or null
 */
export const getUserByEmail = async (
    email: string
): Promise<{
    _id: string
    isOnboarded?: boolean
    [key: string]: any
} | null> => {
    try {
        const apiUrl = getApiUrl()

        const response = await axios.get(`${apiUrl}/user`, {
            params: { email }
        })

        const result = response.data

        if (result.status && result.data) {
            return result.data
        }

        return null
    } catch (error) {
        console.error("Error in getUserByEmail:", error)
        return null
    }
}

/**
 * Get user by ID
 * @param userId - User ID
 * @returns User data or null
 */
export const getUserById = async (
    userId: string
): Promise<{
    _id: string
    isOnboarded?: boolean
    [key: string]: any
} | null> => {
    try {
        const apiUrl = getApiUrl()

        const response = await axios.get(`${apiUrl}/user`, {
            params: { userId }
        })

        const result = response.data

        if (result.status && result.data) {
            return result.data
        }

        return null
    } catch (error) {
        console.error("Error in getUserById:", error)
        return null
    }
}
