import { sendRequest } from "./api"

/**
 * Onboarding-specific utility functions
 * Extracted from onboarding app to shared utils
 */

// Check if username is available
export async function checkUsernameAvailable(
    username: string,
    token?: string
): Promise<boolean> {
    try {
        const response = await sendRequest({
            url: `/user/username-check?username=${username}`,
            method: "GET",
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        })

        return Boolean(response.success && response.data?.available === true)
    } catch {
        return false
    }
}

// Get user by ID for onboarding
export async function getOnboardingUser(
    userId: string,
    token?: string
): Promise<any> {
    try {
        const response = await sendRequest({
            url: `/user?userId=${userId}`,
            method: "GET",
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        })

        return response.success ? response.data : null
    } catch {
        return null
    }
}
