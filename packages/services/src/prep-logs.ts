import type { PrepLog, PrepLogsResponse } from "@tbe/types"
import { trackEvent } from "@tbe/utils"

export const prepLogsService = {
    async getByUserId(userId: string): Promise<PrepLog[]> {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/prep-log?userId=${userId}`,
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            )

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result: PrepLogsResponse = await response.json()

            if (!result.status) {
                throw new Error("Failed to fetch prep logs")
            }

            return result.data || []
        } catch (error) {
            console.error("Error fetching prep logs:", error)
            throw error
        }
    },

    async create(data: {
        title: string
        description?: string
        timeSpent: number
        userId: string
    }): Promise<PrepLog> {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/prep-log`,
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

            if (!result.status) {
                throw new Error("Failed to create prep log")
            }

            // Analytics
            try {
                trackEvent("prep_log_create", {
                    category: "prep_log",
                    value: data.timeSpent,
                    title: data.title
                })
            } catch {}

            return result.data
        } catch (error) {
            console.error("Error creating prep log:", error)
            throw error
        }
    },

    async update(data: {
        title?: string
        description?: string
        timeSpent?: number
        prepLogId: string
    }): Promise<PrepLog> {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/prep-log`,
                {
                    method: "PUT",
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

            if (!result.status) {
                throw new Error("Failed to update prep log")
            }

            try {
                trackEvent("prep_log_update", {
                    category: "prep_log",
                    value: data.timeSpent,
                    prepLogId: data.prepLogId
                })
            } catch {}

            return result.data
        } catch (error) {
            console.error("Error updating prep log:", error)
            throw error
        }
    },

    async delete(id: string): Promise<void> {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/prep-log?prepLogId=${id}`,
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

            if (!result.status) {
                throw new Error("Failed to delete prep log")
            }

            try {
                trackEvent("prep_log_delete", {
                    category: "prep_log",
                    prepLogId: id
                })
            } catch {}
        } catch (error) {
            console.error("Error deleting prep log:", error)
            throw error
        }
    }
}
