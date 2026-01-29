import { trackEvent } from "./analytics"
import { sendRequest } from "./api"

/**
 * Prep Logs Service
 *
 * Extracted from prep-yatra and made reusable
 * Handles all prep log-related API operations
 */

export interface PrepLog {
    _id: string
    user: string
    title: string
    description?: string
    timeSpent: number
    mentorFeedback?: string
    createdAt: string
    updatedAt: string
    __v: number
}

export interface CreatePrepLogRequest {
    title: string
    description?: string
    timeSpent: number
}

export interface UpdatePrepLogRequest {
    logId: string
    title?: string
    description?: string
    timeSpent?: number
    mentorFeedback?: string
}

export const prepLogsService = {
    // Get all prep logs for a user
    async getByUserId(userId: string): Promise<PrepLog[]> {
        try {
            const response = await sendRequest({
                url: `/api/v1/prepyatra/prep-logs?userId=${userId}`,
                method: "GET"
            })

            if (!response.success) {
                throw new Error("Failed to fetch prep logs")
            }

            return response.data || []
        } catch (error) {
            console.error("Error fetching prep logs:", error)
            throw error
        }
    },

    // Create a new prep log
    async create(
        data: CreatePrepLogRequest & { user: string }
    ): Promise<PrepLog> {
        try {
            const response = await sendRequest({
                url: `/api/v1/prepyatra/prep-logs`,
                method: "POST",
                data
            })

            if (!response.success) {
                throw new Error("Failed to create prep log")
            }

            // Analytics
            try {
                trackEvent("prep_log_create", {
                    category: "prep_yatra",
                    value: data.timeSpent,
                    title: data.title
                })
            } catch { /* Ignore tracking errors */ }

            return response.data
        } catch (error) {
            console.error("Error creating prep log:", error)
            throw error
        }
    },

    // Update a prep log
    async update(data: UpdatePrepLogRequest): Promise<PrepLog> {
        try {
            const response = await sendRequest({
                url: `/api/v1/prepyatra/prep-logs/${data.logId}`,
                method: "PUT",
                data: {
                    title: data.title,
                    description: data.description,
                    timeSpent: data.timeSpent,
                    mentorFeedback: data.mentorFeedback
                }
            })

            if (!response.success) {
                throw new Error("Failed to update prep log")
            }

            // Analytics
            try {
                trackEvent("prep_log_update", {
                    category: "prep_yatra",
                    logId: data.logId
                })
            } catch { /* Ignore tracking errors */ }

            return response.data
        } catch (error) {
            console.error("Error updating prep log:", error)
            throw error
        }
    },

    // Delete a prep log
    async delete(logId: string): Promise<void> {
        try {
            const response = await sendRequest({
                url: `/api/v1/prepyatra/prep-logs/${logId}`,
                method: "DELETE"
            })

            if (!response.success) {
                throw new Error("Failed to delete prep log")
            }

            // Analytics
            try {
                trackEvent("prep_log_delete", {
                    category: "prep_yatra",
                    logId
                })
            } catch { /* Ignore tracking errors */ }
        } catch (error) {
            console.error("Error deleting prep log:", error)
            throw error
        }
    }
}
