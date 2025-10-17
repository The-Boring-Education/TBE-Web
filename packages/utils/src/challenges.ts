import { sendRequest } from "./api"
import { trackEvent } from "./analytics"
import type {
    Challenge,
    ChallengeLog,
    ChallengeProgress,
    CreateChallengeRequest,
    UpdateChallengeRequest,
    CreateChallengeLogRequest,
    SocialMediaTemplate
} from "@tbe/types"

/**
 * Challenges Service
 *
 * Extracted from prep-yatra and made reusable
 * Handles all challenge-related API operations
 */

export const challengesService = {
    // Get all challenges for a user
    async getByUserId(userId: string): Promise<Challenge[]> {
        try {
            const response = await sendRequest({
                url: `/prepyatra/challenges?userId=${userId}`,
                method: "GET"
            })

            if (!response.success) {
                throw new Error("Failed to fetch challenges")
            }

            return response.data || []
        } catch (error) {
            console.error("Error fetching challenges:", error)
            throw error
        }
    },

    // Create a new challenge
    async create(
        data: CreateChallengeRequest & { user: string }
    ): Promise<Challenge> {
        try {
            const response = await sendRequest({
                url: `/prepyatra/challenges`,
                method: "POST",
                body: data
            })

            if (!response.success) {
                throw new Error("Failed to create challenge")
            }

            // Analytics
            try {
                trackEvent("challenge_create", {
                    category: "challenge",
                    value: data.totalDays,
                    challengeName: data.name,
                    challengeCategory: data.category
                })
            } catch {}

            return response.data
        } catch (error) {
            console.error("Error creating challenge:", error)
            throw error
        }
    },

    // Update a challenge
    async update(data: UpdateChallengeRequest): Promise<Challenge> {
        try {
            const response = await sendRequest({
                url: `/prepyatra/challenges/${data.challengeId}`,
                method: "PUT",
                body: {
                    name: data.name,
                    totalDays: data.totalDays,
                    category: data.category,
                    isActive: data.isActive
                }
            })

            if (!response.success) {
                throw new Error("Failed to update challenge")
            }

            // Analytics
            try {
                trackEvent("challenge_update", {
                    category: "challenge",
                    challengeId: data.challengeId,
                    updatedFields: Object.keys(data).filter(
                        (key) => key !== "challengeId"
                    )
                })
            } catch {}

            return response.data
        } catch (error) {
            console.error("Error updating challenge:", error)
            throw error
        }
    },

    // Delete a challenge
    async delete(challengeId: string): Promise<void> {
        try {
            const response = await sendRequest({
                url: `/prepyatra/challenges/${challengeId}`,
                method: "DELETE"
            })

            if (!response.success) {
                throw new Error("Failed to delete challenge")
            }

            // Analytics
            try {
                trackEvent("challenge_delete", {
                    category: "challenge",
                    challengeId
                })
            } catch {}
        } catch (error) {
            console.error("Error deleting challenge:", error)
            throw error
        }
    },

    // Get challenge logs
    async getLogs(challengeId: string): Promise<ChallengeLog[]> {
        try {
            const response = await sendRequest({
                url: `/prepyatra/challenges/${challengeId}/logs`,
                method: "GET"
            })

            if (!response.success) {
                throw new Error("Failed to fetch challenge logs")
            }

            return response.data || []
        } catch (error) {
            console.error("Error fetching challenge logs:", error)
            throw error
        }
    },

    // Create a challenge log entry
    async createLog(data: CreateChallengeLogRequest): Promise<ChallengeLog> {
        try {
            const response = await sendRequest({
                url: `/prepyatra/challenges/${data.challengeId}/logs`,
                method: "POST",
                body: data
            })

            if (!response.success) {
                throw new Error("Failed to create challenge log")
            }

            // Analytics
            try {
                trackEvent("challenge_log_create", {
                    category: "challenge",
                    challengeId: data.challengeId,
                    day: data.day,
                    hoursSpent: data.hoursSpent
                })
            } catch {}

            return response.data
        } catch (error) {
            console.error("Error creating challenge log:", error)
            throw error
        }
    },

    // Get challenge progress with analytics
    async getProgress(challengeId: string): Promise<ChallengeProgress> {
        try {
            const response = await sendRequest({
                url: `/prepyatra/challenges/${challengeId}/progress`,
                method: "GET"
            })

            if (!response.success) {
                throw new Error("Failed to fetch challenge progress")
            }

            return response.data
        } catch (error) {
            console.error("Error fetching challenge progress:", error)
            throw error
        }
    },

    // Generate social media template
    generateSocialMediaTemplate(
        challenge: Challenge,
        currentLog: ChallengeLog,
        nextGoals: string[] = []
    ): SocialMediaTemplate {
        const appUrl =
            process.env.NEXT_PUBLIC_PREPYATRA_BASE_URL ||
            "https://prepyatra.theboringeducation.com"

        return {
            challengeName: challenge.name,
            currentDay: currentLog.day,
            progressText: currentLog.progressText,
            nextGoals: nextGoals.length > 0 ? nextGoals : currentLog.nextGoals,
            appUrl
        }
    },

    // Format social media message
    formatSocialMediaMessage(template: SocialMediaTemplate): string {
        const goals = template.nextGoals
            .map((goal, index) => `${index + 1}. ${goal}`)
            .join("\n")

        return `Today was Day ${template.currentDay} of ${template.challengeName}

I worked on - 
${template.progressText}

My next goal is - 
${goals}

---
Learning it on Prep Yatra. Visit ${template.appUrl} to create your challenge.`
    }
}
