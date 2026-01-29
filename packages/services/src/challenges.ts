import type {
    Challenge,
    ChallengeLog,
    ChallengeProgress,
    CreateChallengeLogRequest,
    CreateChallengeRequest,
    SocialMediaTemplate,
    UpdateChallengeRequest} from "@tbe/types"
import { trackEvent } from "@tbe/utils"

export const challengesService = {
    // Get all challenges for a user
    async getByUserId(userId: string): Promise<Challenge[]> {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/challenges?userId=${userId}`,
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            )

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()

            // Check for both 'success' and 'status' properties to handle different API response formats
            if (!result.success && !result.status) {
                throw new Error("Failed to fetch challenges")
            }

            // Return empty array if data is empty, but don't treat it as an error
            return result.data || []
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
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/challenges`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                }
            )

            if (!response.ok) {
                const errorText = await response.text()
                console.error("API error response:", errorText)
                throw new Error(
                    `HTTP error! status: ${response.status}, message: ${errorText}`
                )
            }

            const result = await response.json()

            if (!result.success && !result.status) {
                throw new Error(
                    "Failed to create challenge - API returned unsuccessful response"
                )
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

            return result.data
        } catch (error) {
            console.error("Error creating challenge:", error)
            throw error
        }
    },

    // Update a challenge
    async update(data: UpdateChallengeRequest): Promise<Challenge> {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/challenges/${data.challengeId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: data.name,
                        totalDays: data.totalDays,
                        category: data.category,
                        isActive: data.isActive
                    })
                }
            )

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()

            if (!result.success && !result.status) {
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

            return result.data
        } catch (error) {
            console.error("Error updating challenge:", error)
            throw error
        }
    },

    // Delete a challenge
    async delete(challengeId: string): Promise<void> {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/challenges/${challengeId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            )

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()

            if (!result.success && !result.status) {
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
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/challenges/${challengeId}/logs`,
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            )

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()

            if (!result.success && !result.status) {
                throw new Error("Failed to fetch challenge logs")
            }

            return result.data || []
        } catch (error) {
            console.error("Error fetching challenge logs:", error)
            throw error
        }
    },

    // Create a challenge log entry
    async createLog(data: CreateChallengeLogRequest): Promise<ChallengeLog> {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/challenges/${data.challengeId}/logs`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                }
            )

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()

            if (!result.success && !result.status) {
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

            return result.data
        } catch (error) {
            console.error("Error creating challenge log:", error)
            throw error
        }
    },

    // Get challenge progress with analytics
    async getProgress(challengeId: string): Promise<ChallengeProgress> {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/challenges/${challengeId}/progress`,
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            )

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()

            if (!result.success && !result.status) {
                throw new Error("Failed to fetch challenge progress")
            }

            return result.data
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
        const appUrl = process.env.NEXT_PUBLIC_BASE_URL

        return {
            challengeName: challenge.name,
            currentDay: currentLog.day,
            progressText: currentLog.progressText,
            nextGoals: nextGoals.length > 0 ? nextGoals : currentLog.nextGoals,
            appUrl: appUrl || ""
        }
    },

    // Format social media message
    formatSocialMediaMessage(template: SocialMediaTemplate): string {
        const goals = template.nextGoals
            .map((goal: string, index: number) => `${index + 1}. ${goal}`)
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
